type Point = { x: number; y: number };

// Clip an authored stone triangle to the display rectangle. The resulting UVs
// use wall coordinates, so neighboring stones keep exactly matching image seams.
export function clipDisplay(triangle: Point[], left: number, bottom: number, width: number, height: number) {
  let polygon = triangle;
  for (const [axis, edge, sign] of [
    ["x", left, 1], ["x", left + width, -1], ["y", bottom, 1], ["y", bottom + height, -1],
  ] as const) {
    const input = polygon; polygon = [];
    input.forEach((end, index) => {
      const start = input[(index + input.length - 1) % input.length];
      const a = (start[axis] - edge) * sign >= 0, b = (end[axis] - edge) * sign >= 0;
      if (a !== b) {
        const t = (edge - start[axis]) / (end[axis] - start[axis]);
        polygon.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t });
      }
      if (b) polygon.push(end);
    });
  }
  return polygon.map(point => ({ ...point, u: (point.x - left) / width, v: (point.y - bottom) / height }));
}
