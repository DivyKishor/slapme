import { useCallback, useState } from 'react';
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

  return (
    <div className="h-full min-h-[100dvh] font-sans antialiased">
      {phase === 'landing' && <LandingScreen onStart={() => setPhase('mic')} />}
      {phase === 'mic' && <MicPermissionScreen onStream={handleStream} />}
      {phase === 'live' && micStream && (
        <LiveScreen stream={micStream} onNeedMicAgain={backToMic} />
      )}
    </div>
  );
}
