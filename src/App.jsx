import { useCallback, useEffect, useState } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { LiveScreen } from './components/LiveScreen';
import { MicPermissionScreen } from './components/MicPermissionScreen';

/**
 * Flow: landing → mic (getUserMedia in click hander) → live Web Audio loop.
 * Stream is created on "Enable Mic" so mobile browsers keep it in the user-gesture chain.
 */
export default function App() {
  const [phase, setPhase] = useState('landing');
  const [micStream, setMicStream] = useState(null);
  const [badRouteToast, setBadRouteToast] = useState(null);

  const releaseStream = useCallback(() => {
    setMicStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  const handleStream = useCallback((stream) => {
    setMicStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return stream;
    });
    setPhase('live');
  }, []);

  const backToMic = useCallback(() => {
    releaseStream();
    setPhase('mic');
  }, [releaseStream]);

  useEffect(() => {
    // This app doesn’t use routing; if someone lands on /whatever, show feedback once,
    // then normalize the URL back to / so future reloads are consistent.
    const { pathname } = window.location;
    if (pathname && pathname !== '/') {
      setBadRouteToast('Wrong link — sending you to the chaos.');
      window.history.replaceState({}, '', '/');
      window.setTimeout(() => setBadRouteToast(null), 1800);
    }
  }, []);

  return (
    <div className="h-full min-h-[100dvh] font-sans antialiased select-none">
      {badRouteToast && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-bold text-white/80 shadow-xl backdrop-blur-md">
          {badRouteToast}
        </div>
      )}
      {phase === 'landing' && <LandingScreen onStart={() => setPhase('mic')} />}
      {phase === 'mic' && <MicPermissionScreen onStream={handleStream} />}
      {phase === 'live' && micStream && (
        <LiveScreen stream={micStream} onNeedMicAgain={backToMic} />
      )}
    </div>
  );
}
