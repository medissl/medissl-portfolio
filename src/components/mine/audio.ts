export type SoundPreference = { enabled: boolean; music: number; effects: number };
export const defaultSound: SoundPreference = { enabled: false, music: 0.2, effects: 0.5 };
export const soundKey = "medissl-mine-sound-v1";
export function readSound(value: string | null): SoundPreference {
  try {
    const p = JSON.parse(value || "null");
    const volume = (v: unknown, fallback: number) => typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
    return { enabled: p?.enabled === true, music: volume(p?.music, 0.2), effects: volume(p?.effects, 0.5) };
  } catch { return { ...defaultSound }; }
}

// Audio follows existing engine phases; it never changes or delays the journey.
export function createMineAudio(unavailable: () => void) {
  const music = new Audio("/mine/audio/cave.ogg"); music.loop = true; music.preload = "none";
  let preference = { ...defaultSound }, phase = "ready", paused = false, disposed = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  const voices = new Set<HTMLAudioElement>();
  const play = (voice: HTMLAudioElement) => {
    void voice.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (!disposed && preference.enabled && !document.hidden) unavailable();
    });
  };
  const stopEffects = () => {
    clearInterval(timer); timer = undefined;
    for (const voice of voices) { voice.pause(); voice.removeAttribute("src"); voice.load(); }
    voices.clear();
  };
  const sample = (name: string, gain: number, rate = 1) => {
    if (disposed || !preference.enabled || document.hidden || preference.effects === 0 || voices.size >= 8) return;
    const voice = new Audio(`/mine/audio/${name}`);
    voice.volume = preference.effects * gain; voice.playbackRate = rate;
    voice.addEventListener("ended", () => voices.delete(voice), { once: true });
    voice.addEventListener("error", () => { voices.delete(voice); if (!disposed && preference.enabled) unavailable(); }, { once: true });
    voices.add(voice); play(voice);
  };
  const sync = () => {
    stopEffects();
    if (disposed || document.hidden || !preference.enabled) { music.pause(); return; }
    music.volume = preference.music;
    if (preference.music > 0) play(music); else music.pause();
    if (paused) return;
    if (phase === "drilling") {
      sample("motor.mp3", 0.5, 1.3);
      timer = setInterval(() => sample("impactMining_001.ogg", 0.16), 180);
    } else if (phase === "breaking") {
      sample("impactMining_000.ogg", 0.65);
      sample("impactMining_001.ogg", 0.3, 0.75);
    } else if (phase === "travelling") {
      sample("motor.mp3", 0.24, 0.8);
      timer = setInterval(() => sample("impactMetal_light_000.ogg", 0.14, 0.8), 340);
    }
  };
  const visibility = () => sync();
  document.addEventListener("visibilitychange", visibility);
  return {
    configure(value: SoundPreference) { preference = value; sync(); },
    phase(value: string, isPaused: boolean) {
      if (phase === value && paused === isPaused) return;
      const enteringPanel = isPaused && !paused;
      phase = value; paused = isPaused; sync();
      if (enteringPanel) sample("impactBell_heavy_000.ogg", 0.08, 1.4);
    },
    dispose() {
      disposed = true; stopEffects(); music.pause(); music.removeAttribute("src"); music.load();
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
