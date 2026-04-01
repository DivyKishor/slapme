import { SOUND_MANIFEST } from '../constants/soundManifest';

const preloaded = new Map();
let fallbackCtx = null;

function getFallbackContext() {
  if (!fallbackCtx) {
    fallbackCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (fallbackCtx.state === 'suspended') {
    fallbackCtx.resume().catch(() => {});
  }
  return fallbackCtx;
}

/** Short synthetic hit when files 404 / decode fails */
function playFallbackBeep(modeId, volume = 0.35) {
  const ctx = getFallbackContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const freq = modeId === 'chaos' ? 440 : modeId === 'soft' ? 330 : 380;
  o.type = modeId === 'chaos' ? 'square' : 'sine';
  o.frequency.value = freq;
  g.gain.value = volume * (modeId === 'soft' ? 0.4 : 1);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.08);
}

/**
 * Preload all manifest URLs once (idempotent).
 */
export function preloadSounds(keys) {
  const urls = [...new Set(keys.map((k) => SOUND_MANIFEST[k]).filter(Boolean))];
  urls.forEach((url) => {
    if (preloaded.has(url)) return;
    const a = new Audio();
    a.preload = 'auto';
    a.src = url;
    preloaded.set(url, a);
  });
}

export function pickRandomSoundUrl(modeSoundKeys) {
  const keys = modeSoundKeys.filter((k) => SOUND_MANIFEST[k]);
  if (!keys.length) return null;
  const key = keys[Math.floor(Math.random() * keys.length)];
  return SOUND_MANIFEST[key];
}

/**
 * Play with cooldown enforced by caller. volumeScale: soft mode uses ~0.55
 */
export function playSoundFromMode(mode, volumeScale = 1) {
  const url = pickRandomSoundUrl(mode.soundKeys);
  if (!url) {
    playFallbackBeep(mode.id, 0.35 * volumeScale);
    return;
  }
  let el = preloaded.get(url);
  if (!el) {
    el = new Audio(url);
    preloaded.set(url, el);
  }
  el.volume = Math.min(1, (mode.id === 'soft' ? 0.55 : 0.95) * volumeScale);

  const play = () => {
    el.currentTime = 0;
    el.play().catch(() => playFallbackBeep(mode.id, 0.35 * volumeScale));
  };

  // If file missing, onerror → beep once
  el.onerror = () => playFallbackBeep(mode.id, 0.35 * volumeScale);

  play();
}
