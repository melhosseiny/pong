import { body } from "/components/body.js";

const config = {
  fillStyle: "black",
  m: 90718.5,
  v: [0, 0],
  a: [0, 0]
}

export function table(spec) {
  const use = body({ ...config, ...spec });

  return Object.freeze({
    move: use.move,
    render: use.render
  })
}
