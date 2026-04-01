import { useState } from 'react';

const MIC_CONSTRAINTS = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
};

export function MicPermissionScreen({ onStream }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const enable = async () => {
    setError(null);
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS);
      onStream(stream);
    } catch (e) {
      setError(e?.message || 'Microphone access denied');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#080010] to-[#1e1035] px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(236, 72, 153, 0.25), transparent 50%)',
        }}
      />
      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <p className="text-3xl font-black text-white sm:text-5xl">We need your mic 👀</p>
        <p className="mt-3 text-lg font-semibold text-white/50">Trust us.</p>
        <button
          type="button"
          disabled={busy}
          onClick={enable}
          className="mt-10 rounded-full border-2 border-fuchsia-400/60 bg-fuchsia-500/20 px-10 py-3.5 text-lg font-bold text-fuchsia-100 backdrop-blur-sm transition hover:bg-fuchsia-500/30 enabled:active:scale-95 disabled:opacity-50"
        >
          {busy ? '…' : 'Enable Mic'}
        </button>
        {error && (
          <div className="mt-8 flex max-w-sm flex-col gap-3">
            <p className="text-sm text-rose-300/90">{error}</p>
            <button
              type="button"
              onClick={enable}
              className="rounded-full bg-white/10 py-2 text-sm font-bold text-white"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
