import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Very quiet optional bed so the page isn’t totally dead — user toggle.
 */
export function useAmbientDrone(enabled) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);

  const stopNodes = useCallback(() => {
    const n = nodesRef.current;
    if (n) {
      try {
        n.osc.stop();
      } catch {
        /* already stopped */
      }
      n.osc.disconnect();
      n.gain.disconnect();
      nodesRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !on) {
      stopNodes();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      return;
    }

    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55;
    gain.gain.value = 0.018;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    nodesRef.current = { osc, gain };

    return () => {
      stopNodes();
      ctx.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [enabled, on, stopNodes]);

  return { ambientOn: on, setAmbientOn: setOn };
}
