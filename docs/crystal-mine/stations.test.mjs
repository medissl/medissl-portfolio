import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Exercise the actual TypeScript data contract using the existing compiler.
const sourceUrl = new URL('../../src/components/mine/projects.ts', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
});
const moduleExports = {};
new Function('require', 'exports', outputText)(createRequire(sourceUrl), moduleExports);
const { mineProjects, repositoryProjects } = moduleExports;
assert.deepEqual(mineProjects.map(p => p.id), ['sakiko', 'jellink']);
assert.equal(repositoryProjects.length, 10, 'preserve the prepared catalog');
for (const station of mineProjects) {
  for (const field of ['image', 'gallery', 'repository', 'link']) {
    assert.ok(station[field], `${station.id} requires ${field}`);
  }
  for (const image of [station.image, station.gallery]) {
    assert.ok(existsSync(new URL(`../../public${image}`, import.meta.url)), image);
  }
}
console.log('Two-station contract, complete media and preserved catalog passed.');
