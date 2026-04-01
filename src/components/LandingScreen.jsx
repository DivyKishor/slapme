export function LandingScreen({ onStart }) {
  return (
    <div className="relative flex h-full min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#0a0018] to-[#1a0a2e] px-6">
      {/* Breathing glow */}
      <div
        className="pointer-events-none absolute inset-0 animate-pulse-glow opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(168, 85, 247, 0.35), transparent 55%)',
        }}
      />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
          Tap your laptop.
        </h1>
        <p className="mt-4 text-base font-semibold text-white/45 sm:text-lg">
          Turn your sound on 🔊
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-10 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-[0_0_40px_rgba(192,38,211,0.45)] transition hover:scale-105 active:scale-95"
        >
          Start
        </button>
      </div>
    </div>
  );
}
