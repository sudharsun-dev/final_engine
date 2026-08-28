import { useState, useRef, useCallback, useEffect } from 'react';
import { startAudioAnalysis, stopAudioAnalysis } from '../services/audioAnalyzer';

export const useAudioAnalyzer = () => {
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [telemetry, setTelemetry] = useState({
    isAnalyzing: false,
    sampleRate: 48000,
    channels: 1,
    rms: 0.0,
    peak: 0.0,
    audioLevel: 0,
    windowCount: 0,
    pcmBitRate: '768 kbps raw PCM',
    uplinkRate: '0 KB/s',
    quality: 'INACTIVE',
    windowDuration: '2.5 s',
    windowSize: '40,000 samples'
  });

  const handleTelemetryUpdate = useCallback((metrics) => {
    setTelemetry((prev) => ({ ...prev, ...metrics }));
  }, []);

  const start = async () => {
    setAudioError(null);
    const res = await startAudioAnalysis(canvasRef, handleTelemetryUpdate);
    if (res.success) {
      setIsAnalyzing(true);
    } else {
      setAudioError(res.error || 'Failed to start microphone audio analysis');
      setIsAnalyzing(false);
    }
  };

  const stop = () => {
    stopAudioAnalysis();
    setIsAnalyzing(false);
    setTelemetry((prev) => ({
      ...prev,
      isAnalyzing: false,
      rms: 0.0,
      peak: 0.0,
      audioLevel: 0,
      quality: 'STOPPED'
    }));
  };

  // Cleanup on unmount if requested or keep running across navigation as per section 52 rule:
  // "Do not stop the audio analyzer because the user changes page".
  // So we do NOT stop audio in unmount cleanup unless explicitly requested.

  return {
    canvasRef,
    isAnalyzing,
    audioError,
    telemetry,
    start,
    stop
  };
};
