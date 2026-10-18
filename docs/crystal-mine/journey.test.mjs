import assert from 'node:assert/strict';
import { journeyAt } from '../../src/components/mine/journey.ts';
assert.equal(journeyAt(0).cameraZ, 7);
assert.equal(journeyAt(1.2).phase, 'breaking');
assert.equal(journeyAt(2.2).phase, 'travelling');
assert.equal(journeyAt(4.5).cameraZ, -17);
assert.equal(journeyAt(100).complete, true);
let previous = 7;
for (let t = 0; t <= 5; t += 0.01) {
  const state = journeyAt(t);
  assert.ok(state.cameraZ <= previous + 0.000001, 'camera must never move backwards');
  assert.ok(state.cameraZ >= -17, 'camera must never pass the station');
  if (t < 2) assert.ok(state.cameraZ >= 0.5, 'cart waits until debris has cleared');
  previous = state.cameraZ;
}
console.log('Journey timing, clearance, monotonic movement and final stop passed.');
