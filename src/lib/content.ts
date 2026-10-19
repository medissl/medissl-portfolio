// Shared validation for CMS links and the public catalog. Never render executable URLs.
export function externalUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : null;
  } catch { return null; }
}

export function isLocalMedia(path: string): boolean {
  return /^\/mine\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(path) && !path.includes("..");
}

export function isArtwork(category: string): boolean {
  return ["Digital Art", "Traditional Art"].includes(category);
}
