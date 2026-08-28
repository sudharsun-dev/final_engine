import React from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { AudioWaveform } from '../components/AudioWaveform';
import { AudioTelemetry } from '../components/AudioTelemetry';
import { VoiceEngine } from '../components/VoiceEngine';
import { RiskAssessment } from '../components/RiskAssessment';
import { Activity, ShieldCheck } from 'lucide-react';

export const LiveAnalysis = () => {
  const { canvasRef, isAnalyzing, audioError, telemetry, start, stop } = useAudioAnalyzer();

  return (
    <div className="live-analysis-page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
              <Activity size={20} style={{ color: 'var(--accent-teal)' }} />
              LIVE VOICE AUTHENTICITY & SIGNAL ANALYZER
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Direct browser microphone capture with Web Audio API DSP analysis and continuous window telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isAnalyzing ? (
              <button onClick={start} className="btn btn-primary">
                START AUDIO ANALYSIS
              </button>
            ) : (
              <button onClick={stop} className="btn btn-danger">
                STOP AUDIO ANALYSIS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio Waveform Canvas */}
      <AudioWaveform 
        canvasRef={canvasRef}
        isAnalyzing={isAnalyzing}
        audioError={audioError}
        telemetry={telemetry}
        onStart={start}
        onStop={stop}
      />

      {/* DSP & Stream Telemetry */}
      <AudioTelemetry telemetry={telemetry} />

      {/* Voice Authenticity Engine UI */}
      <VoiceEngine />

      {/* Multi-Signal Analysis Engine */}
      <RiskAssessment />
    </div>
  );
};
