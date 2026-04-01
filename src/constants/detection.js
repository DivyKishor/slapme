/**
 * Mic tap / slap detection tuning — tweak these for your environment.
 * Increase THRESHOLD if false positives from room noise; decrease if taps barely register.
 */
export const RMS_THRESHOLD = 0.045;
/** Minimum jump in RMS vs previous frame to count as a spike */
export const SPIKE_DELTA = 0.028;
/** Ignore triggers within this window (ms) — prevents sound/text spam */
export const TRIGGER_COOLDOWN_MS = 380;
/** Smoothing for RMS display (0–1). Higher = smoother bar */
export const RMS_SMOOTH = 0.22;
/** Running max decay per frame for visual normalization */
export const PEAK_DECAY = 0.985;
