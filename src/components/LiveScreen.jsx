import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { preloadSounds, playSoundFromMode } from '../audio/playReactionSound';
import { MODES, WAITING_PROMPTS } from '../constants/reactions';
import { SOUND_MANIFEST } from '../constants/soundManifest';
import { useAmbientDrone } from '../hooks/useAmbientDrone';
import { useTapDetector } from '../hooks/useTapDetector';
import { randomReaction } from '../utils/randomReaction';
import { IntensityMeter } from './IntensityMeter';
import { ShareOverlay } from './ShareOverlay';

const MODE_LIST = [MODES.funny, MODES.chaos, MODES.soft];

export function LiveScreen({ stream, onNeedMicAgain }) {
  const [mode, setMode] = useState(MODES.funny);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const [reaction, setReaction] = useState('Tap your laptop');
  const [waitingPrompt, setWaitingPrompt] = useState(WAITING_PROMPTS[0]);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [flash, setFlash] = useState(null); // { color, key }
  const [pulseScale, setPulseScale] = useState(1);
  const [showShare, setShowShare] = useState(false);

  const shareAtRef = useRef(3 + Math.floor(Math.random() * 3)); // 3, 4, or 5
  const tapCountRef = useRef(0);
  const pulseTimerRef = useRef(0);

  const { ambientOn, setAmbientOn } = useAmbientDrone(true);

  const punchScale = useCallback(() => {
    window.clearTimeout(pulseTimerRef.current);
    setPulseScale(1.09);
    pulseTimerRef.current = window.setTimeout(() => setPulseScale(1), 140);
  }, []);

  const onTap = useCallback(() => {
    const m = modeRef.current;
    setReaction(randomReaction());
    setWaitingPrompt(WAITING_PROMPTS[Math.floor(Math.random() * WAITING_PROMPTS.length)]);
    tapCountRef.current += 1;
    if (tapCountRef.current >= shareAtRef.current) {
      setShowShare(true);
    }
    setHasTriggered(true);
    setFlash({ color: m.flash, key: Date.now() });
    punchScale();
    window.setTimeout(() => setFlash(null), 170);

    playSoundFromMode(m, m.id === 'soft' ? 1 : 1);
  }, [punchScale]);

  const { rmsDisplay, analysisError, hintTapHarder } = useTapDetector(onTap, stream);

  useEffect(() => {
    preloadSounds(Object.keys(SOUND_MANIFEST));
    return () => window.clearTimeout(pulseTimerRef.current);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Tap your laptop',
          text: 'This stupid site heard me slap my laptop.',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setReaction('Link copied 📋');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setReaction('Link copied 📋');
      } catch {
        setReaction('Share blocked — copy the URL!');
      }
    }
  }, []);

  const handleShareAgain = useCallback(() => {
    setShowShare(false);
    tapCountRef.current = 0;
    shareAtRef.current = 3 + Math.floor(Math.random() * 3);
    setReaction('Tap your laptop');
  }, []);

  const bgStyle = useMemo(
    () => ({
      background: `radial-gradient(ellipse 100% 80% at 50% 20%, color-mix(in srgb, ${mode.accentFrom} 22%, transparent), #020004 45%, #050008)`,
    }),
    [mode.accentFrom],
  );

  return (
    <div
      className="relative flex h-full min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-8"
      style={bgStyle}
    >
      {flash && (
        <div
          key={flash.key}
          className="pointer-events-none absolute inset-0 z-50 animate-[fadeQuick_0.17s_ease-out_forwards]"
          style={{ backgroundColor: flash.color }}
        />
      )}

      <style>{`
        @keyframes fadeQuick {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <div
        className="relative z-10 flex w-full max-w-lg flex-col items-center text-center transition-transform duration-100 ease-out"
        style={{ transform: `scale(${pulseScale})` }}
      >
        {analysisError ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-2xl font-black text-white">Mic didn&apos;t work</p>
            <p className="text-white/50">{analysisError}</p>
            <button
              type="button"
              onClick={onNeedMicAgain}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-8 py-3 font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              Tap your laptop
            </h2>
            <p
              className="mt-3 min-h-[1.5em] text-lg font-bold sm:text-xl"
              style={{ color: mode.accentTo }}
            >
              {reaction}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/40">{waitingPrompt}</p>

            <div className="mt-10 w-full max-w-md">
              <IntensityMeter
                level={rmsDisplay}
                accentFrom={mode.accentFrom}
                accentTo={mode.accentTo}
              />
            </div>

            {hintTapHarder && (
              <p className="mt-6 animate-pulse text-sm font-semibold text-amber-200/80">
                Tap harder — we&apos;re listening 👀
              </p>
            )}

            {hasTriggered && (
              <div className="mt-10 w-full max-w-md opacity-100 transition-opacity duration-300">
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-sm">
                  {MODE_LIST.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                        mode.id === m.id
                          ? 'bg-white text-black'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!analysisError && (
        <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setAmbientOn((v) => !v)}
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-bold text-white/50 backdrop-blur-md transition hover:text-white/80"
          >
            {ambientOn ? '🔇 Mood off' : '🔈 Mood'}
          </button>
        </div>
      )}

      {showShare && (
        <ShareOverlay
          onAgain={handleShareAgain}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
