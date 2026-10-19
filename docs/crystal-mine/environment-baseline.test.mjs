import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// The owner approved Astra's environment, not a new approximation of it.
const path = 'src/components/mine/scene.ts';
const historical = execFileSync('git', ['show', `b55744c:${path}`], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
const recovered = readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const start = '  const scene = new THREE.Scene();';
const originalEnvironment = historical.slice(historical.indexOf(start), historical.indexOf('  const walls:')).trimEnd();
const currentEnvironment = recovered.slice(recovered.indexOf(start), recovered.indexOf('// END APPROVED ASTRA ENVIRONMENT')).trimEnd();
// Owner correction, 19 October: lift the obstructing central ceiling stones;
// keep display frames and every other environmental property in place.
const originalRoof = 'rock(0.8 * Math.sin(bay), 7.8, z, 5.2, 1.7, 3.6, darkStone);';
const raisedRoof = 'rock(0.8 * Math.sin(bay), 10.2, z, 5.2, 1.7, 3.6, darkStone);';
assert.equal(currentEnvironment.split(raisedRoof).length, 2, 'only the explicitly approved ceiling translation is allowed');
const closureStart = currentEnvironment.indexOf('  // BEGIN OWNER-APPROVED CEILING CLOSURE');
const closureEnd = currentEnvironment.indexOf('  // END OWNER-APPROVED CEILING CLOSURE.\n') + '  // END OWNER-APPROVED CEILING CLOSURE.\n'.length;
assert.ok(closureStart > 0 && closureEnd > closureStart);
const closure = currentEnvironment.slice(closureStart, closureEnd);
assert.equal(createHash('sha256').update(closure).digest('hex'), '1784ddd3a26092acc7573fee6abcd07fa7c0d8425d54c983800b4154345c5738', 'only the approved stone infill and dripstone attachment block may differ');
assert.equal(currentEnvironment.replace(closure, '').replace(raisedRoof, originalRoof), originalEnvironment, 'preserve all other approved geometry, textures, foliage, lights, renderer and camera');
const recoveredPhase1 = execFileSync('git', ['show', `4450f1c:${path}`], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
assert.equal(recoveredPhase1.slice(recoveredPhase1.indexOf(start), recoveredPhase1.indexOf('  const walls:')).trimEnd(), originalEnvironment);
console.log('Astra baseline preserved except approved ceiling lift, matching-stone closure and attached dripstones.');
