import { ball } from "/components/ball.js";
import { paddle } from "/components/paddle.js";
import { table } from "/components/table.js";
import { barrier } from "/components/barrier.js";

import { range, rand_sign } from "/util.js";

const keys = [];

export function game(spec) {
  let bodies = [];
  let collisions = [];
  let t0;
  let ani_frame_id;
  let score = [0, 0];
  let ai = true;

  const detect_collisions = (t, t0) => {
    collisions = [];
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        if (j === i) continue;
        const [p_a, p_b] = [bodies[i].sim_move(t, t0), bodies[j].sim_move(t, t0)];
        if (bodies[i].will_intersect(bodies[j], p_a, p_b)) {
          collisions.push([bodies[i], bodies[j]]);
        }
      }
    }
  }

  const resolve_collisions = () => {
    collisions.forEach(([b1, b2]) => {
      b1.collide(b2);
    });
  }

  const paddle2_ai = (ball, paddle2) => {
    const ball_p = ball.get_p();
    const ball_v = ball.get_v();
    const paddle2_p = paddle2.get_p();
    if (ball_v[0] > 0) {
      if (paddle2_p[1] > ball_p[1]) {
        paddle2.set_v([0,-0.5]);
      } else if (paddle2_p[1] < ball_p[1]) {
        paddle2.set_v([0,0.5]);
      }
    }
  }

  const get_rand_v = () => {
    return [rand_sign() * range(0.2, 0.5), rand_sign() * range(0.05, 0.1)];
  }

  const reset_ball = (ball) => {
    ball.set_p([540, 300]);
    ball.set_v(get_rand_v());
  }

  const start = (context, audio_context) => {
    const { width: canvas_w, height: canvas_h } = context.canvas;

    const pong_table = table({ context, audio_context, p: [0, 0], d: [canvas_w, canvas_h] });
    const pong_ball = ball({ context, audio_context, id: 'ball', p: [canvas_w / 2, canvas_h / 2], v: get_rand_v() });
    const paddle1 = paddle({ context, audio_context, id: 'p1', p: [0, canvas_h / 2 - 50] });
    const paddle2 = paddle({ context, audio_context, id: 'p2', p: [canvas_w - 15.7, canvas_h / 2 - 50], v: [0, 0.1] });
    const barrier_t = barrier({ context, audio_context, id: 'b1', p: [0, 0 - 100] });
    const barrier_b = barrier({ context, audio_context, id: 'b2', p: [0, canvas_h] });

    bodies.push(pong_ball, paddle1, paddle2, barrier_t, barrier_b);

    const update_score = () => {
      const ball_p = pong_ball.get_p();
      if (ball_p[0] < 0) {
        score[1]++;
      }
      if (ball_p[0] > canvas_w) {
        score[0]++;
      }
      if (ball_p[0] < 0 || ball_p[0] > canvas_w) {
        reset_ball(pong_ball);
        pong_ball.make_sound();
      }
    }

    const move = (t) => {
      detect_collisions(t, t0);
      resolve_collisions();
      if (!t0) {
        t0 = t;
      }
      if (t - t0 > 1000 / 60) {
        pong_table.render();
        if (keys[87]) { // w
          paddle1.set_v([0,-0.5]);
        }
        if (keys[83]) { // s
          paddle1.set_v([0,0.5]);
        }

        if (ai) {
          paddle2_ai(pong_ball, paddle2);
        }
        if (keys[38]) { // up
          paddle2.set_v([0,-0.5]);
          ai = false;
        }
        if (keys[40]) { // down
          paddle2.set_v([0,0.5]);
          ai = false;
        }
        paddle1.move(t, t0);
        paddle2.move(t, t0);
        paddle1.set_v([0,0]);
        paddle2.set_v([0,0]);
        pong_ball.move(t, t0);
        update_score();
        context.font = 'bold 16px system-ui';
        context.fillStyle = 'cyan';
        context.fillText(`t ${(t / 1000).toFixed(2)}`, 10, 26);
        context.fillText(`${score[0]}`, canvas_w / 2 - 100, 26);
        context.fillText(`${score[1]}`, canvas_w / 2 + 100, 26);

        t0 = t;
      }

      ani_frame_id = requestAnimationFrame(move);
    }

    ani_frame_id = requestAnimationFrame(move);
  }

  return Object.freeze({
    start
  })
}

// key events
document.body.addEventListener("keydown", (e) => {
  keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", (e) => {
  keys[e.keyCode] = false;
});
