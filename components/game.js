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
  let id;
  let score = [0, 0];

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

  const get_rand_v = () => {
    return [rand_sign() * range(0.2, 0.5), rand_sign() * range(0.05, 0.1)];
  }

  const reset_ball = (ball) => {
    ball.set_p([540,300]);
    ball.set_v(get_rand_v());
  }

  const start = (context) => {
    const { width: canvas_w, height: canvas_h } = context.canvas;

    const pong_table = table({ context, p: [0, 0], d: [canvas_w, canvas_h] });
    const pong_ball = ball({ context, id: 'ball', p: [540, 300], v: get_rand_v() });
    const paddle1 = paddle({ context, id: 'p1', p: [0, 300 - 50] });
    const paddle2 = paddle({ context, id: 'p2', p: [1080 - 15.7, 300 - 50], v: [0, 0.1] });
    const barrier_t = barrier({ context, id: 'b1', p: [0,0 - 100] });
    const barrier_b = barrier({ context, id: 'b2', p: [0,600] });

    bodies.push(pong_ball, paddle1, paddle2, barrier_t, barrier_b);

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
        if (keys[38]) { // up
          paddle2.set_v([0,-0.5]);
        }
        if (keys[40]) { // down
          paddle2.set_v([0,0.5]);
        }
        barrier_t.move(t, t0);
        barrier_b.move(t, t0);
        paddle1.move(t, t0);
        paddle2.move(t, t0);
        paddle1.set_v([0,0]);
        paddle2.set_v([0,0]);
        pong_ball.move(t, t0);
        // update score
        const ball_p = pong_ball.get_p();
        if (ball_p[0] < 0) {
          score[1]++;
          reset_ball(pong_ball);
        }
        if (ball_p[0] > canvas_w) {
          score[0]++;
          reset_ball(pong_ball);
        }
        context.font = '16px system-ui';
        context.fillStyle = 'cyan';
        context.fillText(`${score[0]}`, canvas_w / 2 - 100, 26);
        context.fillText(`${score[1]}`, canvas_w / 2 + 100, 26);
        // context.fillText(`col ${collisions.map(c => `${c[0].id}, ${c[1].id}`)}`, 10, 500);

        // const [v1_x, v1_y] = pong_ball.get_v();
        // let theta = Math.atan(v1_y / v1_x);
        // const theta_deg = (180 / Math.PI) * theta;
        // context.fillText(`theta ${[v1_x.toFixed(2), v1_y.toFixed(2)]}, ratio ${(v1_y / v1_x).toFixed(2)}, deg ${theta_deg.toFixed(2)}`, 10, 550);
        t0 = t;
      }

      id = requestAnimationFrame(move);
    }

    id = requestAnimationFrame(move);
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
