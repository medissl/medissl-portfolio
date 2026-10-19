import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// The owner approved Astra's environment, not a new approximation of it.
const path = 'src/components/mine/scene.ts';
const historical = execFileSync('git', ['show', `b55744c:${path}`], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
const recovered = readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const start = '  const scene = new THREE.Scene();';
const originalEnvironment = historical.slice(historical.indexOf(start), historical.indexOf('  const walls:')).trimEnd();
const currentEnvironment = recovered.slice(recovered.indexOf(start), recovered.indexOf('// END APPROVED ASTRA ENVIRONMENT')).trimEnd();
assert.equal(currentEnvironment, originalEnvironment, 'do not change approved geometry, textures, foliage, lights, renderer or initial camera without owner approval');
const recoveredPhase1 = execFileSync('git', ['show', `4450f1c:${path}`], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
assert.equal(recoveredPhase1.slice(recoveredPhase1.indexOf(start), recoveredPhase1.indexOf('  const walls:')).trimEnd(), originalEnvironment);
console.log('Approved Astra environment matches both original and recovered Phase 1 checkpoints exactly.');
