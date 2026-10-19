import assert from 'node:assert/strict';
import { createMineAudio, readSound } from '../../src/components/mine/audio.ts';
assert.deepEqual(readSound('broken'), {enabled:false,music:.2,effects:.5});
assert.deepEqual(readSound('{"enabled":true,"music":8,"effects":-3}'), {enabled:true,music:1,effects:0});
const sounds = [], listeners = new Map(), timers = new Set();
globalThis.Audio = class {
  constructor(src) { this.src = src; this.paused = true; sounds.push(this); }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  addEventListener() {}
  removeAttribute() { this.src = ''; }
  load() {}
};
globalThis.document = { hidden:false, addEventListener:(k,v)=>listeners.set(k,v), removeEventListener:k=>listeners.delete(k) };
globalThis.setInterval = callback => { timers.add(callback); return callback; };
globalThis.clearInterval = callback => timers.delete(callback);
let failures = 0;
const audio = createMineAudio(()=>failures++);
assert.ok(sounds.every(s=>s.paused), 'no autoplay before opt-in');
audio.configure({enabled:true,music:.2,effects:.5});
for (let i=0;i<30;i++) {
  audio.phase('drilling',false); assert.equal(timers.size,1);
  audio.phase('breaking',false); assert.equal(timers.size,0);
  audio.phase('travelling',false); assert.equal(timers.size,1);
  audio.phase('ready',false); assert.equal(timers.size,0);
  assert.equal(sounds.filter(s=>!s.paused).length,1,'only music remains after each journey');
}
document.hidden=true; listeners.get('visibilitychange')(); assert.ok(sounds.every(s=>s.paused));
document.hidden=false; listeners.get('visibilitychange')(); assert.equal(sounds.filter(s=>!s.paused).length,1);
audio.configure({enabled:false,music:.2,effects:.5}); assert.ok(sounds.every(s=>s.paused));
audio.configure({enabled:true,music:0,effects:0}); audio.phase('drilling',false); assert.ok(sounds.every(s=>s.paused));
audio.dispose(); assert.equal(listeners.size,0); assert.equal(timers.size,0); assert.ok(sounds.every(s=>s.paused));
assert.equal(failures,0);
console.log('Audio opt-in, validated preferences, 30 journeys, mute, hidden/resume and disposal passed.');
