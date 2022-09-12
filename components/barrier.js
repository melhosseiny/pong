import { body } from "/components/body.js";

const config = {
  fillStyle: "red",
  d: [1080, 100],
  m: 100,
  v: [0, 0],
  a: [0, 0]
}

export function barrier(spec) {
  const use = body({ ...config, ...spec });

  return Object.freeze({
    ...use
  })
}
