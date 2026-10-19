// These times follow the existing scene: cracks at .65, fracture at 1.2,
// falling fragments after 1.2, arrival at 4.5. Audio never advances the engine.
export type AudioFrame = { moving: boolean; elapsed: number; speed: number };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function journeySound(frame: AudioFrame) {
  if (!frame.moving) return { drill: 0, contact: 0, wheels: 0, rate: 0.65 };
  const t = frame.elapsed;
  return {
    // The bit keeps rotating while travelling: retain a quiet unloaded motor
    // after contact, then wind down with the arrival instead of going silent.
    drill: clamp(t / 0.22) * (0.16 + 0.84 * clamp((1.65 - t) / 0.45)) * clamp((4.5 - t) / 0.3),
    contact: clamp((t - 0.65) / 0.22) * clamp((1.45 - t) / 0.25),
    wheels: Math.sqrt(clamp(frame.speed / 10)),
    rate: 0.65 + 0.55 * clamp(frame.speed / 10),
  };
}
export const stoneCues = [
  { at: 0.65, offset: 0.45, duration: 0.2, gain: 0.4, rate: 1 },
  { at: 0.95, offset: 0.25, duration: 0.2, gain: 0.5, rate: 1 },
  { at: 1.2, offset: 0, duration: 1.05, gain: 1.15, rate: 1 },
  { at: 1.65, offset: 0.35, duration: 0.5, gain: 0.4, rate: 0.9 },
  { at: 2.1, offset: 0.65, duration: 0.3, gain: 0.3, rate: 1.2 },
];

export type SoundPreference = { enabled: boolean; music: number; effects: number };
export const defaultSound: SoundPreference = { enabled: true, music: 0.2, effects: 0.5 };
export const soundKey = "medissl-mine-sound-v1";
export function readSound(value: string | null): SoundPreference {
  try {
    const p = JSON.parse(value || "null");
    const volume = (v: unknown, fallback: number) => typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
    return { enabled: typeof p?.enabled === "boolean" ? p.enabled : defaultSound.enabled, music: volume(p?.music, 0.2), effects: volume(p?.effects, 0.5) };
  } catch { return { ...defaultSound }; }
}

// Decoded recordings, separate buses and sample-accurate loops. The scene's
// actual frames drive movement and impacts; there are no sound-effect timers.
export function createMineAudio(unavailable: () => void) {
  let preference = { ...defaultSound }, paused = false, disposed = false;
  let context: AudioContext | undefined, musicBus: GainNode, effectsBus: GainNode;
  let music: AudioBufferSourceNode | undefined, loading: Promise<void> | undefined;
  let current: AudioFrame = { moving: false, elapsed: 0, speed: 0 }, previous = 0;
  const buffers = new Map<string, AudioBuffer>();
  const loops = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();
  const voices = new Set<AudioBufferSourceNode>();
  const uiVoices = new Set<AudioBufferSourceNode>();
  const abort = new AbortController();
  const failed = () => { if (!disposed && preference.enabled && !document.hidden) unavailable(); };
  const active = () => Boolean(context && !disposed && preference.enabled && !document.hidden);
  const ramp = (param: AudioParam, value: number, time = 0.035) => param.setTargetAtTime(value, context!.currentTime, time);
  function stopLoops() {
    for (const { source, gain } of loops.values()) { source.stop(); source.disconnect(); gain.disconnect(); }
    loops.clear();
  }
  const stopEffects = (includeUI = false) => {
    stopLoops();
    for (const voice of voices) { voice.stop(); voice.disconnect(); }
    voices.clear();
    if (includeUI) { for (const voice of uiVoices) { voice.stop(); voice.disconnect(); } uiVoices.clear(); }
  };
  function sample(name: string, level: number, rate: number, offset: number, duration: number, ui = false) {
    const buffer = buffers.get(name);
    if (!active() || (paused && !ui) || preference.effects === 0 || !buffer || voices.size >= 16 || (ui && uiVoices.size > 0)) return;
    const group = ui ? uiVoices : voices;
    const source = context!.createBufferSource(), gain = context!.createGain();
    source.buffer = buffer; source.playbackRate.value = rate; gain.gain.value = level;
    source.connect(gain).connect(effectsBus); group.add(source);
    source.onended = () => { group.delete(source); source.disconnect(); gain.disconnect(); };
    source.start(0, offset, duration);
  }
  // Overlap the tail with the head of the recording, removing codec padding
  // and hard seams without replacing the recording with synthesized noise.
  function seamless(buffer: AudioBuffer, seconds: number) {
    const overlap = Math.min(Math.floor(seconds * buffer.sampleRate), Math.floor(buffer.length / 4));
    const length = buffer.length - overlap;
    const result = context!.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const input = buffer.getChannelData(channel), output = result.getChannelData(channel);
      output.set(input.subarray(overlap, length));
      for (let i = 0; i < overlap; i++) {
        const mix = i / overlap;
        output[length - overlap + i] = input[length + i] * (1 - mix) + input[i] * mix;
      }
    }
    return result;
  }
  function loop(name: string, level: number, rate: number) {
    if (!buffers.has(name)) return;
    let voice = loops.get(name);
    if (!voice && level > 0.001) {
      const source = context!.createBufferSource(), gain = context!.createGain();
      source.buffer = buffers.get(name)!; source.loop = true; gain.gain.value = 0;
      source.connect(gain).connect(effectsBus); source.start();
      voice = { source, gain }; loops.set(name, voice);
    }
    if (voice) { ramp(voice.gain.gain, level); ramp(voice.source.playbackRate, rate); }
  }
  function movement() {
    if (!active() || paused || preference.effects === 0 || !current.moving) { stopLoops(); return; }
    const levels = journeySound(current);
    loop("drill-motor.wav", levels.drill * 1.1, 0.9 + levels.drill * 0.15);
    loop("drill-contact.wav", levels.contact * 0.7, 1);
    loop("wheels.wav", levels.wheels * 0.9, levels.rate);
  }
  function sync() {
    if (!context || disposed) return;
    ramp(musicBus.gain, preference.music * 0.5);
    ramp(effectsBus.gain, preference.effects);
    if (!active()) { stopEffects(true); void context.suspend().catch(failed); return; }
    // Called synchronously by configure on the user's opt-in gesture.
    void context.resume().then(() => { if (!disposed && !active()) void context?.suspend().catch(failed); }).catch(failed);
    if (!music && buffers.has("cave.ogg")) {
      music = context.createBufferSource(); music.buffer = buffers.get("cave.ogg")!;
      music.loop = true; music.connect(musicBus); music.start();
    }
    if (preference.effects === 0) stopEffects(true); else if (paused) stopEffects(); else movement();
  }
  function prepare() {
    if (!context) {
      context = new AudioContext(); musicBus = context.createGain(); effectsBus = context.createGain();
      const master = context.createGain(), limiter = context.createDynamicsCompressor();
      master.gain.value = 0.7; limiter.threshold.value = -4; limiter.knee.value = 4;
      limiter.ratio.value = 12; limiter.attack.value = 0.003; limiter.release.value = 0.12;
      musicBus.connect(master); effectsBus.connect(master); master.connect(limiter).connect(context.destination);
    }
    sync();
    if (!loading && buffers.size < 6) {
      loading = Promise.allSettled(["cave.ogg", "drill-motor.wav", "drill-contact.wav", "wheels.wav", "rock-break.wav", "impactBell_heavy_000.ogg"].map(async name => {
        if (buffers.has(name)) return;
        const response = await fetch(`/mine/audio/${name}`, { signal: abort.signal });
        if (!response.ok) throw new Error(`Audio ${response.status}`);
        const buffer = await context!.decodeAudioData(await response.arrayBuffer());
        if (!disposed) buffers.set(name, ["cave.ogg", "drill-motor.wav", "drill-contact.wav", "wheels.wav"].includes(name) ? seamless(buffer, name === "cave.ogg" ? 0.3 : 0.05) : buffer);
        sync();
      })).then(results => { if (results.some(result => result.status === "rejected")) failed(); }).finally(() => { loading = undefined; });
    }
  };
  const visibility = () => sync();
  document.addEventListener("visibilitychange", visibility);
  return {
    configure(value: SoundPreference) {
      preference = readSound(JSON.stringify(value));
      try { if (preference.enabled) prepare(); else sync(); } catch { failed(); }
    },
    phase(_value: string, isPaused: boolean) { paused = isPaused; sync(); },
    ui() { sample("impactBell_heavy_000.ogg", 0.12, 1.8, 0, 0.8, true); },
    frame(value: AudioFrame) {
      const before = current.moving ? previous : value.elapsed; current = value; previous = value.elapsed;
      if (!value.moving) { previous = 0; stopEffects(); return; }
      movement();
      if (value.elapsed < before) return;
      for (const cue of stoneCues) if (before < cue.at && value.elapsed >= cue.at) sample("rock-break.wav", cue.gain, cue.rate, cue.offset, cue.duration);
    },
    dispose() {
      disposed = true; abort.abort(); stopEffects(true); music?.stop(); music?.disconnect(); buffers.clear();
      void context?.close().catch(() => {});
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
