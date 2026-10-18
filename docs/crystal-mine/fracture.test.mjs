import assert from 'node:assert/strict';
import { clipDisplay } from '../../src/components/mine/fracture.ts';
const area = polygon => Math.abs(polygon.reduce((sum, p, i) => {
  const q = polygon[(i + 1) % polygon.length]; return sum + p.x * q.y - q.x * p.y;
}, 0)) / 2;
for (const [width, height] of [[4, 2], [1, 3], [4, 3]]) {
  const pieces = [
    [{x:-5,y:-5},{x:5,y:-5},{x:5,y:5}],
    [{x:-5,y:-5},{x:5,y:5},{x:-5,y:5}],
  ].map(triangle => clipDisplay(triangle, -width / 2, -height / 2, width, height));
  assert.ok(Math.abs(pieces.reduce((sum, p) => sum + area(p), 0) - width * height) < 1e-9, 'fragments cover image without gaps or overlaps');
  for (const p of pieces.flat()) {
    assert.ok(p.u >= 0 && p.u <= 1 && p.v >= 0 && p.v <= 1);
    assert.ok(Math.abs(p.u * width - width / 2 - p.x) < 1e-9);
    assert.ok(Math.abs(p.v * height - height / 2 - p.y) < 1e-9);
  }
}
assert.deepEqual(clipDisplay([{x:7,y:7},{x:8,y:7},{x:7,y:8}], -2, -1, 4, 2), []);
console.log('Landscape, portrait and placeholder fracture coverage/UV alignment passed.');
