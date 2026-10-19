import assert from 'node:assert/strict';
import { createMineAudio, readSound, journeySound, stoneCues } from '../../src/components/mine/audio.ts';
import { journeyAt } from '../../src/components/mine/journey.ts';

assert.deepEqual(readSound('broken'), {enabled:true,music:.2,effects:.5});
assert.deepEqual(readSound(null), {enabled:true,music:.2,effects:.5});
assert.deepEqual(readSound('{}'), {enabled:true,music:.2,effects:.5});
assert.deepEqual(readSound('{"enabled":false,"music":0.13,"effects":0.7}'), {enabled:false,music:.13,effects:.7});
assert.deepEqual(readSound('{"enabled":true,"music":8,"effects":-3}'), {enabled:true,music:1,effects:0});
const contexts = [], sources = [], listeners = new Map(), requests = [];
class Param { value=0; setTargetAtTime(value) { this.value=value; } }
class Node {
  gain=new Param(); playbackRate=new Param(); threshold=new Param(); knee=new Param();
  ratio=new Param(); attack=new Param(); release=new Param();
  connect(node) { this.output=node; return node; }
  disconnect() {}
  start(...args) { this.started=true; this.startArgs=args; }
  stop() { this.stopped=true; this.onended?.(); }
}
function buffer(channels=1,length=500,rate=100) {
  const data=Array.from({length:channels},()=>new Float32Array(length).fill(.25));
  return {numberOfChannels:channels,length,sampleRate:rate,getChannelData:i=>data[i]};
}
globalThis.AudioContext=class {
  currentTime=0; destination=new Node(); state='suspended';
  constructor() { contexts.push(this); }
  createGain() {return new Node();} createDynamicsCompressor() {return new Node();}
  createBufferSource() {const node=new Node();sources.push(node);return node;}
  createBuffer=buffer;
  decodeAudioData() {return Promise.resolve(buffer());}
  resume() {this.state='running';return Promise.resolve();}
  suspend() {this.state='suspended';return Promise.resolve();}
  close() {this.state='closed';return Promise.resolve();}
};
globalThis.document={hidden:false,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
let rejectFile=false;
globalThis.fetch=async url=>{requests.push(url);return {ok:!rejectFile,status:503,arrayBuffer:async()=>new ArrayBuffer(1)};};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
let failures=0;
const audio=createMineAudio(()=>failures++);
assert.equal(contexts.length,0,'no context, fetch or autoplay before gesture');
audio.configure({enabled:true,music:.2,effects:.5});await flush();
assert.equal(requests.length,6);assert.equal(contexts[0].state,'running');
assert.deepEqual(requests.map(url=>url.split('/').at(-1)).sort(), ['cave.ogg','drill-contact.wav','drill-motor.wav','impactBell_heavy_000.ogg','rock-break.wav','wheels.wav']);
const music=sources[0]; assert.ok(music.loop);
assert.equal(music.buffer.length,470,'music uses a decoded crossfade');
assert.equal(music.buffer.getChannelData(0)[469],.25);

for(let journey=0;journey<30;journey++) {
  const start=sources.length;
  let lastZ=7;
  for(let frame=1;frame<=449;frame++) {
    const elapsed=frame/100, next=journeyAt(elapsed);
    audio.frame({moving:true,elapsed,speed:Math.abs(next.cameraZ-lastZ)/.01}); lastZ=next.cameraZ;
    if(frame===120) audio.phase('breaking',false);
    if(frame===210) audio.phase('travelling',false);
  }
  const created=sources.slice(start);
  assert.equal(created.filter(s=>s.loop).length,3,'one motor, wheel and contact loop per journey');
  assert.equal(created.filter(s=>!s.loop).length,stoneCues.length,'each stone cue crosses once');
  assert.deepEqual(created.filter(s=>!s.loop).map(s=>s.startArgs),stoneCues.map(cue=>[0,cue.offset,cue.duration]),'cracks/debris use actual rock-recording segments');
  audio.frame({moving:false,elapsed:0,speed:0});
  assert.ok(created.every(s=>s.stopped),'skip/arrival leaves no effects behind');
  assert.ok(!music.stopped,'phase transitions keep music continuous');
}
assert.equal(requests.length,6,'decoded assets reused across all stations');
assert.equal(journeySound({moving:true,elapsed:.3,speed:8}).drill,1);
assert.equal(journeySound({moving:true,elapsed:2,speed:8}).drill,.16,'quiet motor follows the still-spinning bit');
assert.equal(journeySound({moving:true,elapsed:4.5,speed:0}).drill,0);
assert.equal(journeySound({moving:true,elapsed:4.49,speed:0}).wheels,0);
assert.equal(journeySound({moving:false,elapsed:1,speed:8}).drill,0);

// Enabling in the middle must not replay missed impacts in a burst.
audio.frame({moving:true,elapsed:2.2,speed:6});
let count=sources.filter(s=>!s.loop).length;
audio.frame({moving:true,elapsed:2.21,speed:6});
assert.equal(sources.filter(s=>!s.loop).length,count);
audio.phase('travelling',true);assert.ok(sources.slice(1).every(s=>s.stopped));
count=sources.length;audio.ui();audio.ui();assert.equal(sources.length,count+1,'quiet UI chime is allowed in a panel but never stacks');
const chime=sources.at(-1);audio.phase('ready',true);assert.ok(!chime.stopped,'opening the panel does not cut off its chime');
assert.equal(chime.output.gain.value,.12,'UI gain remains below interaction effects');
audio.phase('travelling',false);
document.hidden=true;listeners.get('visibilitychange')();assert.equal(contexts[0].state,'suspended');
assert.ok(sources.slice(1).every(s=>s.stopped));
document.hidden=false;listeners.get('visibilitychange')();await flush();assert.equal(contexts[0].state,'running');
audio.configure({enabled:false,music:.2,effects:.5});assert.equal(contexts[0].state,'suspended');
audio.configure({enabled:true,music:0,effects:0});await flush();
count=sources.length;audio.frame({moving:true,elapsed:2.6,speed:8});assert.equal(sources.length,count);
audio.dispose();assert.equal(contexts[0].state,'closed');assert.equal(listeners.size,0);assert.ok(sources.every(s=>s.stopped));
assert.equal(failures,0);

// Failed assets can retry; a late fetch must not revive a disposed controller.
rejectFile=true;const retry=createMineAudio(()=>failures++);
retry.configure({enabled:true,music:.2,effects:.5});await flush();assert.ok(failures>0);
rejectFile=false;retry.configure({enabled:true,music:.2,effects:.5});await flush();
assert.ok(sources.at(-1).loop);retry.dispose();
const disposed=createMineAudio(()=>assert.fail('disposed load reported an error'));
disposed.configure({enabled:true,music:.2,effects:.5});disposed.dispose();await flush();
assert.equal(contexts.at(-1).state,'closed');
console.log('Audio: 30 frame-driven journeys, cue timing, bounded loops, continuous music, opt-in, mute, hidden/panel pause, retry and disposal passed.');
