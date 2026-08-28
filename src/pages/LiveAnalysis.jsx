import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { AudioWaveform } from '../components/AudioWaveform';
import { AudioTelemetry } from '../components/AudioTelemetry';
import { VoiceEngine } from '../components/VoiceEngine';
import { RiskAssessment } from '../components/RiskAssessment';
import { StatusBadge } from '../components/StatusBadge';
import { Activity, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

export const LiveAnalysis = () => {
  const { scenario, riskScore, recommendedAction } = useGlobalRisk();
  const { canvasRef, isAnalyzing, audioError, telemetry, start, stop } = useAudioAnalyzer();

  const getSecuritySignalText = () => {
    if (scenario === 'HIGH') {
      return "High-risk voice/interaction indicators detected. Sensitive action should be held pending independent verification.";
    }
    if (scenario === 'MEDIUM') {
      return "Moderate voice or interaction risk indicators detected. Additional verification recommended.";
    }
    return "Voice and interaction currently within normal risk threshold.";
  };

  return (
    <div className="live-analysis-page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
              <Activity size={20} style={{ color: 'var(--accent-teal)' }} />
              LIVE VOICE AUTHENTICITY & SIGNAL ANALYZER
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Direct device microphone capture with Web Audio API DSP spectral analysis and continuous telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <StatusBadge scenario={scenario} />
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

      {/* Triggered Security Signal Explanation Card */}
      <div className="card" style={{
        background: scenario === 'HIGH' ? '#fee2e2' : scenario === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
        borderColor: scenario === 'HIGH' ? '#fca5a5' : scenario === 'MEDIUM' ? '#fde047' : '#86efac',
        borderLeft: `6px solid ${scenario === 'HIGH' ? '#dc2626' : scenario === 'MEDIUM' ? '#d97706' : '#16a34a'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {scenario === 'HIGH' && <ShieldAlert size={26} style={{ color: '#dc2626', flexShrink: 0 }} />}
          {scenario === 'MEDIUM' && <AlertTriangle size={26} style={{ color: '#d97706', flexShrink: 0 }} />}
          {scenario === 'LOW' && <ShieldCheck size={26} style={{ color: '#16a34a', flexShrink: 0 }} />}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              TRIGGERED SECURITY SIGNAL EXPLANATION
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {getSecuritySignalText()}
            </p>
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
