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
const { repositoryProjects, artworkProjects } = moduleExports;
assert.deepEqual(repositoryProjects.slice(0, 2).map(p => p.id), ['sakiko', 'jellink']);
assert.equal(repositoryProjects.length, 10, 'preserve the prepared catalog');
assert.equal(new Set(repositoryProjects.map(p => p.id)).size, repositoryProjects.length);
for (const station of repositoryProjects) {
  assert.ok(station.id && station.title && station.repository);
  for (const image of [station.image, ...station.media.map(m => m.src)].filter(Boolean)) {
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

// A healthy empty feed must honor unpublishing, rather than resurrecting the snapshot.
const loaderUrl = new URL('../../src/lib/mine-projects.ts', import.meta.url);
let response = { data: [], error: null }, unavailable = false;
const query = {};
for (const method of ['select', 'eq', 'neq', 'order']) query[method] = () => query;
query.abortSignal = async () => { if (unavailable) throw new Error('offline'); return response; };
const loaderExports = {};
const loaderCode = ts.transpileModule(readFileSync(loaderUrl, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const loaderRequire = name => {
  if (name === '@/components/mine/projects') return moduleExports;
  if (name === '@/components/mine/published-art.json') return snapshot;
  if (name === '@/lib/supabase') return { getServerSupabase: () => ({ from: () => query }), publicMediaUrl: path => path ? `/media/${path}` : null };
  return createRequire(loaderUrl)(name);
};
new Function('require', 'exports', loaderCode)(loaderRequire, loaderExports);
let catalog = await loaderExports.getMineProjects();
assert.equal(catalog.savedArtwork, false);
assert.equal(catalog.projects.length, 10, 'healthy empty feed does not restore old artwork');
response = { data: snapshot, error: null };
catalog = await loaderExports.getMineProjects();
assert.equal(catalog.projects.length, 13);
assert.equal(catalog.projects.flatMap(p => p.media).filter(m => m.section === 'process').length, 2);
response = { data: null, error: { message: 'unavailable' } };
catalog = await loaderExports.getMineProjects();
assert.equal(catalog.savedArtwork, true);
assert.equal(catalog.projects.length, 10, 'an outage must not resurrect unpublished snapshot records');
unavailable = true;
assert.equal((await loaderExports.getMineProjects()).savedArtwork, true, 'thrown connection failure also degrades safely');
unavailable = false;
const created = { ...snapshot[0], id: 'new-cms-work', slug:'new-cms-work', title:'New published software', category:'Interactive', cover_path:null, featured:true, project_media:[] };
response = {data:[...snapshot,created],error:null};
catalog = await loaderExports.getMineProjects();
assert.equal(catalog.projects.length,14,'new published records create stations without a build');
assert.equal(catalog.projects.at(-1).kind,'project','CMS software is not styled as artwork');
assert.equal(catalog.projects.at(-1).image,null);
assert.equal(catalog.projects.at(-1).featured,true);
response = {data:[created],error:null};
assert.equal((await loaderExports.getMineProjects()).projects.length,11,'unpublished records disappear from the healthy feed');
response = {data:Array.from({length:40},(_,i)=>({...created,id:`cms-${i}`,slug:`cms-${i}`})),error:null};
assert.equal((await loaderExports.getMineProjects()).projects.length,50,'catalog has no thirteen-station cap');
console.log('Dynamic publishing, unpublishing, project classification, featured and missing-media cases passed.');
console.log('Live, empty, failed and thrown artwork-feed cases passed.');
