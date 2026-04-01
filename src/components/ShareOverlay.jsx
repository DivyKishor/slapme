export function ShareOverlay({ onAgain, onShare }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-6 backdrop-blur-md">
      <div className="max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-[#1a0a2e] to-black p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.35)]">
        <p className="text-3xl font-black text-white">You broke it 💀</p>
        <p className="mt-2 text-sm text-white/45">legend.</p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAgain}
            className="rounded-full bg-white/10 py-3 font-bold text-white transition hover:bg-white/15"
          >
            Do it again
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 py-3 font-bold text-white shadow-lg transition hover:opacity-95"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
