export const quad_solver = (a, b, c) => {
  const d = b * b - 4 * a * c;
  const r1 = ( - b + Math.sqrt(d) ) / (2 * a);
  const r2 = ( - b - Math.sqrt(d) ) / (2 * a);
  return [r1, r2];
}

export const clamp = (n, l, h) => Math.min(Math.max(n, l), h);
export const range = (l, h) => Math.random() * (l - h) + h;
export const rand_sign = () => Math.random() > 0.5 ? 1 : -1;
