import assert from 'node:assert/strict';
import { journeyAt, nextStation, advanceSceneryTile } from '../../src/components/mine/journey.ts';
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
  if (t < 2) assert.ok(state.cameraZ >= -0.6, 'cart waits until debris has cleared');
  previous = state.cameraZ;
}
console.log('Journey timing, clearance, monotonic movement and final stop passed.');
const drillReach = 2.92 + 1.175 * 0.72 * Math.cos(0.12) * Math.cos(0.32);
assert.ok(Math.abs((journeyAt(1.2).cameraZ - drillReach) - (-4.31)) < 0.02, 'drill tip meets the stone at fracture');
for (const count of [1, 2, 10, 13]) {
  let station = 0, tiles = [0, -48];
  const visited = [];
  for (let i = 0; i < count * 3; i++) {
    visited.push(station);
    station = nextStation(station, count);
    tiles = tiles.map(advanceSceneryTile);
    assert.equal(Math.abs(tiles[0] - tiles[1]), 48, 'tiles remain adjacent');
    assert.ok(tiles.every(z => z >= -48 && z <= 24), 'world coordinates stay bounded');
  }
  assert.equal(new Set(visited).size, count, 'every project is reachable');
  assert.equal(station, 0, 'final station loops back to the first');
}
assert.throws(() => nextStation(0, 0));
console.log('All-project progression, repeated loops and bounded scenery passed.');
