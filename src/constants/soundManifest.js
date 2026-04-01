/**
 * Real clips: project-root `audio/sexy/00.mp3` … `59.mp3` (not under public/).
 * Vite resolves them to stable URLs in dev and hashed assets in production.
 */
const modules = import.meta.glob('../../audio/sexy/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

function keyFromVitePath(path) {
  const m = path.match(/(\d+)\.mp3$/);
  if (!m) return null;
  return `sexy-${m[1].padStart(2, '0')}`;
}

/** Logical id → absolute URL string */
export const SOUND_MANIFEST = {};

for (const [path, url] of Object.entries(modules)) {
  const key = keyFromVitePath(path);
  if (key && typeof url === 'string') {
    SOUND_MANIFEST[key] = url;
  }
}

const sortedKeys = Object.keys(SOUND_MANIFEST).sort((a, b) => {
  const na = parseInt(a.replace('sexy-', ''), 10);
  const nb = parseInt(b.replace('sexy-', ''), 10);
  return na - nb;
});

const n = sortedKeys.length;
const chunk = n > 0 ? Math.ceil(n / 3) : 0;

function orAll(slice) {
  return slice.length ? slice : sortedKeys;
}

/** Mode pools: first / middle / last third of numbered clips; tiny libraries fall back to full list */
export const FUNNY_SOUND_KEYS = chunk ? orAll(sortedKeys.slice(0, chunk)) : sortedKeys;
export const CHAOS_SOUND_KEYS = chunk ? orAll(sortedKeys.slice(chunk, chunk * 2)) : sortedKeys;
export const SOFT_SOUND_KEYS = chunk ? orAll(sortedKeys.slice(chunk * 2)) : sortedKeys;
