import { SOUND_URLS } from '../constants/soundManifest';

let ctx = null;
let unlocked = false;
const buffers = new Map(); // url -> AudioBuffer
const inflight = new Set(); // url
const htmlPool = new Map(); // url -> HTMLAudioElement (warm fallback)

function getCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!ctx) ctx = new Ctx();
  return ctx;
}

async function decodeUrl(url) {
  if (buffers.has(url) || inflight.has(url)) return;
  inflight.add(url);
  try {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const c = getCtx();
    const buf = await c.decodeAudioData(arr);
    buffers.set(url, buf);
  } catch {
    // Ignore; we still have HTMLAudio fallback in playSound.
  } finally {
    inflight.delete(url);
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomMany(arr, count) {
  const copy = [...arr];
  // Fisher–Yates partial shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/**
 * Must be called from a user gesture (we do this on "Enable Mic").
 * Unlocks Web Audio for instant playback later.
 */
export async function unlockAudio() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') await c.resume();

    // Tiny silent click to satisfy stricter autoplay policies.
    const src = c.createBufferSource();
    src.buffer = c.createBuffer(1, 1, c.sampleRate);
    const g = c.createGain();
    g.gain.value = 0;
    src.connect(g);
    g.connect(c.destination);
    src.start();
    unlocked = true;
  } catch {
    unlocked = false;
  }
}

/**
 * Start decoding a few random clips asap (no UI, no awaiting).
 */
export function primeRandom(count = 2) {
  if (!SOUND_URLS.length) return;
  pickRandomMany(SOUND_URLS, count).forEach((u) => decodeUrl(u));
}

/**
 * Warm HTMLAudio elements so fallback is also instant-ish.
 * (Only used before we have decoded buffers.)
 */
export function primeHtmlAudio(count = 10) {
  if (!SOUND_URLS.length) return;
  pickRandomMany(SOUND_URLS, count).forEach((url) => {
    if (htmlPool.has(url)) return;
    const a = new Audio(url);
    a.preload = 'auto';
    try {
      a.load();
    } catch {
      /* ignore */
    }
    htmlPool.set(url, a);
  });
}

/**
 * Decode everything gradually in the background.
 */
export function preloadAllGradually({ batchSize = 8, intervalMs = 25 } = {}) {
  if (!SOUND_URLS.length) return;
  let idx = 0;

  const step = () => {
    const batch = [];
    for (let i = 0; i < batchSize && idx < SOUND_URLS.length; i++, idx++) {
      batch.push(SOUND_URLS[idx]);
    }
    batch.forEach((u) => decodeUrl(u));

    if (idx < SOUND_URLS.length) {
      // Keep the UI thread happy; no visible loading.
      window.setTimeout(step, intervalMs);
    }
  };

  step();
}

/**
 * Play an already-decoded buffer if possible (lowest latency).
 * Falls back to HTMLAudio if buffer isn't ready yet.
 */
export function playRandomSlap({ volume = 0.95 } = {}) {
  if (!SOUND_URLS.length) return false;
  const url = pickRandom(SOUND_URLS);

  // If we have any decoded buffers, ALWAYS play one of those (instant).
  if (unlocked && buffers.size) {
    const readyUrl = buffers.has(url) ? url : pickRandom([...buffers.keys()]);
    const buf = buffers.get(readyUrl);
    if (buf) {
      const c = getCtx();
      if (c.state === 'suspended') c.resume().catch(() => {});
      const src = c.createBufferSource();
      src.buffer = buf;
      const g = c.createGain();
      g.gain.value = Math.min(1, Math.max(0, volume));
      src.connect(g);
      g.connect(c.destination);
      src.start();
      return true;
    }
  }

  // Fallback (may be slightly higher latency on first play, but avoids “no sound”).
  try {
    const a = htmlPool.get(url) || new Audio(url);
    a.preload = 'auto';
    a.volume = Math.min(1, Math.max(0, volume));
    a.currentTime = 0;
    a.play().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

