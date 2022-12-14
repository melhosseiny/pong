import { body } from "/components/body.js";

const config = {
  fillStyle: "orange",
  d: [15.7, 15.7],
  m: 2.7,
  v: [0, 0],
  a: [0, 0],
  sound: { f: 490, d: 257 / 1000 }
}

export function ball(spec) {
  const use = body({ ...config, ...spec });

  return Object.freeze({
    ...use
  })
}
