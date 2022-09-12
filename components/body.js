import { quad_solver } from "/util.js"

export function body(spec) {
  const state = () => {
    return new Proxy(spec, {
      get: (obj, prop) => {
        return obj[prop];
      },
      set: (obj, prop, value) => {
        obj[prop] = value;
        render();
        return true;
      }
    });
  }

  let { context, audio_context, ...rest } = spec;
  let st = state(rest);

  const get_p = () => st.p;
  const set_p = (p) => st.p = p;
  const get_d = () => st.d;
  const get_m = () => st.m;
  const get_v = () => st.v;
  const set_v = (v) => st.v = v;
  const get_a = () => st.a;
  const set_a = (a) => st.a = a;

  const get_center = () => {
    const [x1, y1] = st.p;
    const [w, h] = st.d;
    const [x2, y2] = [x1 + w, y1 + h];
    return [ (x1 + x2) / 2, (y1 + y2) / 2 ] ;
  }

  const get_dist_from_center = (p) => {
    const c = get_center();
    const [xd, yd] = [p[0] - c[0], p[1] - c[1]];
    return Math.sqrt(xd * xd + yd * yd);
  }

  const move = (t, t0) => {
    const p0 = st.p;
    const dt = t - t0;
    st.p = [
      p0[0] + st.v[0] * dt + 0.5 * st.a[0] * dt * dt,
      p0[1] + st.v[1] * dt + 0.5 * st.a[1] * dt * dt
    ];
  }

  const sim_move = (t, t0) => {
    const p0 = st.p;
    const dt = t - t0;
    return [p0[0] + st.v[0] * dt, p0[1] + st.v[1] * dt];
  }

  const will_intersect = (body, p_a, p_b) => {
    const [x1, y1] = p_a;
    const [w, h] = st.d;
    const [x2, y2] = [x1 + w, y1 + h];

    const [x1_, y1_] = p_b;
    const [w_, h_] = body.get_d();
    const [x2_, y2_] = [x1_ + w_, y1_ + h_];

    return x1 < x2_ && x2 > x1_ && y2 > y1_ && y1 < y2_;
  }

  const collide = (body) => {
    const [w2, h2] = body.get_d();
    const orientation = w2 > h2 ? 'h' : 'v';
    const m1 = st.m;
    const center_d = body.get_dist_from_center(st.p);
    const hit_p = Math.tanh((center_d - (15.7 / 2)) / 100);
    const m2 = body.get_m_at ? body.get_m_at(hit_p) : body.get_m();
    const [v1_x, v1_y] = st.v;
    const theta = Math.atan(v1_y / v1_x);
    const theta_deg = (180 / Math.PI) * theta;

    const v1 = Math.sqrt(v1_x * v1_x + v1_y * v1_y);

    const a = (1 + (m1 / m2));
    const b = - 2 * (m1 / m2) * v1 * Math.cos(-theta);
    const c = - (1 - (m1 / m2));

    const r = quad_solver(a, b, c);

    let v1_ = v1_x > 0 && orientation === 'v' || v1_x < 0 && orientation === 'h' ? r[1] : r[0];
    v1_ = [v1_ * Math.cos(-theta), v1_ * Math.sin(-theta)];

    st.v = v1_;
    body.make_sound();
  }

  const make_sound = () => {
    const note_scillator = audio_context.createOscillator();
    note_scillator.type = "sine";
    note_scillator.frequency.setValueAtTime(st.sound.f, audio_context.currentTime);
    note_scillator.connect(audio_context.destination);
    note_scillator.start(0);
    note_scillator.stop(audio_context.currentTime + st.sound.d);
  }

  const render = () => {
    const [x, y] = st.p;
    const [w, h] = st.d;
    context.fillStyle = st.fillStyle;
    context.fillRect(x, y, w, h);
  }

  return Object.freeze({
    id: st.id,
    get_p,
    set_p,
    get_d,
    get_m,
    get_v,
    set_v,
    get_center,
    get_dist_from_center,
    sim_move,
    move,
    will_intersect,
    collide,
    make_sound,
    render
  })
}
