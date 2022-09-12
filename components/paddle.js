import { body } from "/components/body.js";
import { clamp } from "/util.js";

const config = {
  fillStyle: "white",
  d: [15.7, 100],
  m: 70,
  v: [0, 0],
  a: [0, 0],
  sound: { f: 459, d: 96 / 1000 }
}

export function paddle(spec) {
  const use = body({ ...config, ...spec });

  const get_m_at = (p) => {
    return clamp(use.get_m() * Math.abs(p), 2.7, use.get_m());
  }

  const move = (t, t0) => {
    const p0 = use.get_p();
    const dt = t - t0;
    const v = use.get_v();
    let p = [p0[0] + v[0] * dt, p0[1] + v[1] * dt];
    use.set_p([p[0], clamp(p[1], 0, 600 - 100)]);
  }

  return Object.freeze({
    ...use,
    get_m_at,
    move
  })
}
