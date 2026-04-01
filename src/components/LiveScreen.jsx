import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playSlap, warmSounds } from '../audio/playReactionSound';
import { ACCENT_FROM, ACCENT_TO, FLASH_COLOR, WAITING_PROMPTS } from '../constants/reactions';
import { useTapDetector } from '../hooks/useTapDetector';
import { randomReaction } from '../utils/randomReaction';
import { IntensityMeter } from './IntensityMeter';

export function LiveScreen({ stream, onNeedMicAgain }) {
  const [reaction, setReaction] = useState('SlapIt');
  const [waitingPrompt, setWaitingPrompt] = useState(WAITING_PROMPTS[0]);
  const [flash, setFlash] = useState(null); // { color, key }
  const [pulseScale, setPulseScale] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareToast, setShareToast] = useState(null); // string
  const toastTimerRef = useRef(0);

  const shareAtRef = useRef(3 + Math.floor(Math.random() * 3)); // 3, 4, or 5
  const tapCountRef = useRef(0);
  const pulseTimerRef = useRef(0);

  const LIVE_URL = 'https://slapme-beta.vercel.app/';
  const REPO_URL = 'https://github.com/DivyKishor/slapme';

  const punchScale = useCallback(() => {
    window.clearTimeout(pulseTimerRef.current);
    setPulseScale(1.09);
    pulseTimerRef.current = window.setTimeout(() => setPulseScale(1), 140);
  }, []);

  const onTap = useCallback(() => {
    setReaction(randomReaction());
    setWaitingPrompt(WAITING_PROMPTS[Math.floor(Math.random() * WAITING_PROMPTS.length)]);
    tapCountRef.current += 1;
    if (tapCountRef.current >= shareAtRef.current) {
      window.clearTimeout(toastTimerRef.current);
      setShareToast('Do you love it? Share it.');
      toastTimerRef.current = window.setTimeout(() => setShareToast(null), 1600);
    }
    setFlash({ color: FLASH_COLOR, key: Date.now() });
    punchScale();
    window.setTimeout(() => setFlash(null), 170);

    playSlap(0.95);
  }, [punchScale]);

  const { rmsDisplay, analysisError, hintTapHarder } = useTapDetector(onTap, stream);

  useEffect(() => {
    warmSounds();
    return () => {
      window.clearTimeout(pulseTimerRef.current);
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const shareNativeOrCopy = useCallback(async () => {
    const url = LIVE_URL;
    const text = 'SLAPME — turn your mic into chaos.';
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SlapIt',
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setReaction('Live link copied 📋');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setReaction('Live link copied 📋');
      } catch {
        setReaction('Share blocked — copy the URL!');
      }
    }
  }, []);

  const resetRun = useCallback(() => {
    tapCountRef.current = 0;
    shareAtRef.current = 3 + Math.floor(Math.random() * 3);
    setReaction('SlapIt');
  }, []);

  const shareLinks = useMemo(() => {
    const u = encodeURIComponent(LIVE_URL);
    const t = encodeURIComponent('SLAPME — turn your mic into chaos.');
    return [
      { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
      { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
      { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
      { id: 'reddit', label: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
      // Instagram does not support direct web share intents for arbitrary links.
      { id: 'instagram', label: 'Instagram', href: `https://www.instagram.com/` },
    ];
  }, []);

  const copyLiveLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LIVE_URL);
      setReaction('Live link copied 📋');
      setShareOpen(false);
    } catch {
      setReaction('Copy failed — grab the URL');
      setShareOpen(false);
    }
  }, []);

  const copyRepoLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(REPO_URL);
      setReaction('GitHub link copied 📋');
      setShareOpen(false);
    } catch {
      setReaction('Copy failed — grab the URL');
      setShareOpen(false);
    }
  }, []);

  const bgStyle = useMemo(
    () => ({
      background: `radial-gradient(ellipse 100% 80% at 50% 20%, color-mix(in srgb, ${ACCENT_FROM} 22%, transparent), #020004 45%, #050008)`,
    }),
    [],
  );

  return (
    <div
      className="relative flex h-full min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-8"
      style={bgStyle}
    >
      {/* Top-right share */}      
      <div className="fixed right-4 top-4 z-50">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                shareNativeOrCopy();
              } else {
                setShareOpen((v) => !v);
              }
            }}
            className="rounded-full border border-white/15 bg-black/40 px-3 py-2 text-xs font-bold text-white/70 backdrop-blur-md transition hover:text-white"
            aria-label="Share"
            title="Share"
          >
            Share
          </button>

          {!navigator.share && shareOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-black/70 p-2 text-left text-sm text-white/80 shadow-2xl backdrop-blur-md">
              <div className="px-2 pb-1 pt-1 text-xs font-bold text-white/40">Share / Copy</div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={copyLiveLink}
                  className="rounded-xl px-3 py-2 text-left font-semibold hover:bg-white/10"
                  title={LIVE_URL}
                >
                  Copy live link
                </button>
                <button
                  type="button"
                  onClick={copyRepoLink}
                  className="rounded-xl px-3 py-2 text-left font-semibold hover:bg-white/10"
                  title={REPO_URL}
                >
                  Copy GitHub repo
                </button>
                {shareLinks.map((l) => (
                  <a
                    key={l.id}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShareOpen(false)}
                    className="rounded-xl px-3 py-2 font-semibold hover:bg-white/10"
                  >
                    {l.label}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={resetRun}
                  className="rounded-xl px-3 py-2 text-left font-semibold text-white/60 hover:bg-white/10 hover:text-white"
                >
                  Reset streak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
              SlapIt
            </h2>
            <p
              className="mt-3 min-h-[1.5em] text-lg font-bold sm:text-xl"
              style={{ color: ACCENT_TO }}
            >
              {reaction}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/40">{waitingPrompt}</p>

            <div className="mt-10 w-full max-w-md">
              <IntensityMeter
                level={rmsDisplay}
                accentFrom={ACCENT_FROM}
                accentTo={ACCENT_TO}
              />
            </div>

            {hintTapHarder && (
              <p className="mt-6 animate-pulse text-sm font-semibold text-amber-200/80">
                Clap/slap near the mic 👂
              </p>
            )}
          </>
        )}
      </div>

      {shareToast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-bold text-white/80 shadow-xl backdrop-blur-md">
          {shareToast}
        </div>
      )}
    </div>
  );
}
