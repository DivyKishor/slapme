/**
 * Mic tap / slap detection tuning — tweak these for your environment.
 * Increase THRESHOLD if false positives from room noise; decrease if taps barely register.
 */
export const RMS_THRESHOLD = 0.028;
/** Minimum jump in RMS vs previous frame to count as a spike */
export const SPIKE_DELTA = 0.012;
/** Ignore triggers within this window (ms) — prevents sound/text spam */
export const TRIGGER_COOLDOWN_MS = 110;
/** If the spike is VERY strong, allow quicker retriggers (ms) */
export const STRONG_SPIKE_COOLDOWN_MS = 70;
/** Spike delta considered "strong" (bypasses some cooldown) */
export const STRONG_SPIKE_DELTA = 0.04;
/** Very loud sounds (claps near mic) can trigger even without a clean delta spike */
export const LOUD_RMS_THRESHOLD = 0.085;
export const LOUD_RMS_COOLDOWN_MS = 80;
/** Smoothing for RMS display (0–1). Higher = smoother bar */
export const RMS_SMOOTH = 0.22;
/** Running max decay per frame for visual normalization */
export const PEAK_DECAY = 0.985;
