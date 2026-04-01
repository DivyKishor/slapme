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

/** Ordered absolute URLs for all clips */
export const SOUND_URLS = sortedKeys.map((k) => SOUND_MANIFEST[k]);
