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
const { mineProjects, repositoryProjects, artworkProjects } = moduleExports;
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
const snapshot = JSON.parse(readFileSync(new URL('../../src/components/mine/published-art.json', import.meta.url), 'utf8'));
const art = artworkProjects([...snapshot, { ...snapshot[0], slug: 'mewdi-pixel-sprite' }], path => path ? `/media/${path}` : null);
assert.equal(art.length, 3, 'exclude Mewdi without changing records');
assert.equal(art.flatMap(p => p.media).length, 5, 'keep every gallery and process image');
assert.ok(art.flatMap(p => p.media).some(m => m.section === 'process'));
assert.equal(artworkProjects([{ ...snapshot[0], cover_path: null, project_media: [] }], () => null)[0].image, null);
assert.equal(repositoryProjects.filter(p => !p.image).length, 4, 'missing media remains valid catalog data');
assert.equal(repositoryProjects[0].image, '/mine/sakiko-menu.webp');
assert.ok(repositoryProjects[0].media.some(m => m.src.endsWith('sakiko-classroom-day.webp')));
console.log('Station contract, nullable media, complete artwork and preserved catalog passed.');
