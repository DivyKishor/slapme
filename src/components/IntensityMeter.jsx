/**
 * Normalized 0–1 RMS level → horizontal bar + circular pulse ring
 */
export function IntensityMeter({ level, accentFrom, accentTo }) {
  const pct = Math.round(level * 100);
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-md">
      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-white/10"
        style={{
          boxShadow: `0 0 20px color-mix(in srgb, ${accentFrom} 40%, transparent)`,
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-75 ease-out"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
          }}
        />
      </div>
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/15 transition-transform duration-75"
        style={{
          transform: `scale(${1 + level * 0.45})`,
          boxShadow: `0 0 ${28 + level * 40}px color-mix(in srgb, ${accentTo} 55%, transparent)`,
          borderColor: `color-mix(in srgb, ${accentFrom} 50%, transparent)`,
        }}
      >
        <span className="text-xs font-bold tabular-nums text-white/40">{pct}</span>
      </div>
    </div>
  );
}
