import { playRandomSlap, preloadAllGradually, primeRandom } from './audioEngine';

/**
 * Fire-and-forget: prime a couple random clips, then keep decoding the rest.
 * No UI, no blocking.
 */
export function warmSounds() {
  primeRandom(10);
  preloadAllGradually({ batchSize: 12, intervalMs: 18 });
}

/**
 * Instant slap playback.
 */
export function playSlap(volume = 0.95) {
  playRandomSlap({ volume });
}
