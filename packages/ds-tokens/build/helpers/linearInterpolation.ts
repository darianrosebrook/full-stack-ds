// (a, b, n) => (1 - n) * a + n * b;
export const linearInterpolation = (start: number, end: number, t: number) => {
  return (1 - t) * start + t * end;
};
