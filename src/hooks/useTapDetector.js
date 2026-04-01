import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PEAK_DECAY,
  LOUD_RMS_COOLDOWN_MS,
  LOUD_RMS_THRESHOLD,
  RMS_SMOOTH,
  RMS_THRESHOLD,
  SPIKE_DELTA,
  STRONG_SPIKE_COOLDOWN_MS,
  STRONG_SPIKE_DELTA,
  TRIGGER_COOLDOWN_MS,
} from '../constants/detection';

/**
 * RMS + spike detection on an existing MediaStream (from a user-gesture getUserMedia call).
 * Does not stop stream tracks on cleanup — parent owns the stream.
 */
export function useTapDetector(onTap, mediaStream) {
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  const [rmsDisplay, setRmsDisplay] = useState(0);
  const [analysisError, setAnalysisError] = useState(null);
  const [hintTapHarder, setHintTapHarder] = useState(false);

  const ctxRef = useRef(null);
  const rafRef = useRef(0);
  const lastRmsRef = useRef(0);
  const lastTriggerRef = useRef(0);
  const smoothedRef = useRef(0);
  const peakRef = useRef(0.01);
  const quietFramesRef = useRef(0);
  const suppressUntilRef = useRef(0);
  const armedRef = useRef(true);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    lastRmsRef.current = 0;
    suppressUntilRef.current = 0;
    armedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mediaStream) {
      stopLoop();
      return undefined;
    }

    setAnalysisError(null);
    stopLoop();

    let cancelled = false;

    (async () => {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        if (cancelled) {
          ctx.close().catch(() => {});
          return;
        }
        ctxRef.current = ctx;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createMediaStreamSource(mediaStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.35;
        source.connect(analyser);

        const buf = new Uint8Array(analyser.fftSize);
        let frames = 0;

        const loop = () => {
          if (!ctxRef.current) return;
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          const delta = rms - lastRmsRef.current;
          const now = performance.now();

          frames += 1;
          if (rms < 0.012) quietFramesRef.current += 1;
          else quietFramesRef.current = 0;
          if (frames > 120 && quietFramesRef.current > 90) {
            setHintTapHarder(true);
          } else if (rms > 0.02) {
            setHintTapHarder(false);
          }

          const since = now - lastTriggerRef.current;
          const isStrong = delta > STRONG_SPIKE_DELTA;
          const cooldownOk = isStrong
            ? since > STRONG_SPIKE_COOLDOWN_MS
            : since > TRIGGER_COOLDOWN_MS;

          const loudOk = rms > LOUD_RMS_THRESHOLD && since > LOUD_RMS_COOLDOWN_MS;
          const spikeOk = rms > RMS_THRESHOLD && delta > SPIKE_DELTA && cooldownOk;

          // Rearm only after signal settles; prevents playback-feedback loops on mobile.
          if (!armedRef.current && rms < 0.02) {
            armedRef.current = true;
          }

          const notSuppressed = now > suppressUntilRef.current;
          if (armedRef.current && notSuppressed && (loudOk || spikeOk)) {
            lastTriggerRef.current = now;
            suppressUntilRef.current = now + 240;
            armedRef.current = false;
            onTapRef.current({ rms, delta });
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(12);
            }
          }

          lastRmsRef.current = rms;

          smoothedRef.current =
            smoothedRef.current * (1 - RMS_SMOOTH) + rms * RMS_SMOOTH;
          peakRef.current = Math.max(smoothedRef.current, peakRef.current * PEAK_DECAY);
          const normalized =
            peakRef.current > 0 ? smoothedRef.current / peakRef.current : 0;
          setRmsDisplay(Math.min(1, normalized));

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        setAnalysisError(e?.message || 'Audio failed');
      }
    })();

    return () => {
      cancelled = true;
      stopLoop();
    };
  }, [mediaStream, stopLoop]);

  return { rmsDisplay, analysisError, hintTapHarder };
}
