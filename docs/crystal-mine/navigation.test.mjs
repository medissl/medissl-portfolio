import assert from 'node:assert/strict';
import { mineHref, readMineNavigation } from '../../src/components/mine/navigation.ts';
assert.deepEqual(readMineNavigation(new URLSearchParams('project=a&panel=projects&view=projects')), {project:'a',panel:'index',lightweight:true});
assert.equal(readMineNavigation(new URLSearchParams('panel=javascript:alert(1)')).panel,null);
for (const panel of ['project','index','about','settings',null]) {
  const url = new URL(mineHref('id / &?',panel),'https://example.test');
  assert.equal(url.pathname,'/');
  assert.equal(readMineNavigation(url.searchParams).project,'id / &?');
  assert.equal(readMineNavigation(url.searchParams).panel,panel);
}
console.log('Canonical project links, panels and unknown URL input passed.');
