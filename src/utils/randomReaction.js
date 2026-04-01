import { TAP_REACTIONS } from '../constants/reactions';

const EXTRAS = ['💀', '🔥', '✨', '‼️', '😭', '😳'];

/**
 * Picks a reaction line, sometimes with an extra emoji for variety.
 */
export function randomReaction() {
  const base = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
  if (Math.random() < 0.35) {
    const e = EXTRAS[Math.floor(Math.random() * EXTRAS.length)];
    return `${base} ${e}`;
  }
  return base;
}
