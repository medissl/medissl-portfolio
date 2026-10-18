export function journeyAt(seconds: number) {
  const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  const elapsed = Math.max(0, seconds);
  return {
    phase: elapsed < 1.2 ? "drilling" : elapsed < 2.1 ? "breaking" : elapsed < 4.5 ? "travelling" : "ready",
    cameraZ: elapsed < 1.2 ? 7 - smooth(elapsed / 1.2) * 6.5 : 0.5 - smooth((elapsed - 2) / 2.5) * 17.5,
    complete: elapsed >= 4.5,
  };
}

export function nextStation(index: number, count: number) {
  if (!Number.isInteger(count) || count < 1) throw new Error("The mine needs at least one project.");
  return (index + 1) % count;
}

// Two reusable 48-unit scenery tiles cover an unlimited number of 24-unit trips.
export function advanceSceneryTile(z: number) {
  const shifted = z + 24;
  return shifted >= 48 ? shifted - 96 : shifted;
}
