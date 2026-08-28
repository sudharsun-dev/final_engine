import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { ShieldCheck, ShieldAlert, Cpu, Sparkles, CheckCircle } from 'lucide-react';

export const VoiceEngine = () => {
  const { 
    scenario, 
    syntheticProbability, 
    authenticity, 
    confidence, 
    recommendedAction 
  } = useGlobalRisk();

  const stages = [
    { title: 'Audio Preprocessing', desc: 'Noise reduction & gain alignment', status: 'ACTIVE' },
    { title: 'Voice Activity Detection (VAD)', desc: 'Isolating speech segments from silence', status: 'ACTIVE' },
    { title: 'Resampling & Segmentation', desc: '2.5s analysis window framing', status: 'ACTIVE' },
    { title: 'Spectral Analysis', desc: 'Mel-frequency cepstral coefficients (MFCC)', status: 'ACTIVE' },
    { title: 'Prosody & Pitch Analysis', desc: 'Fundamental frequency & cadence mapping', status: 'ACTIVE' },
    { title: 'Voice Clone Detection', desc: 'Deepfake spectral artifact classification', status: scenario === 'HIGH' ? 'FLAGGED' : 'PASS' },
    { title: 'Anti-Spoofing Filter', desc: 'Phase distortion & synthetic buzz check', status: scenario === 'HIGH' ? 'FLAGGED' : 'PASS' },
    { title: 'Replay / Manipulation', desc: 'Acoustic background environment consistency', status: scenario === 'MEDIUM' ? 'WARN' : scenario === 'HIGH' ? 'FLAGGED' : 'PASS' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Sparkles size={18} style={{ color: 'var(--accent-indigo)' }} />
          VOICE AUTHENTICITY ENGINE
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          PROTOTYPE SCENARIO DEMONSTRATOR
        </span>
      </div>

      {/* Metrics Banner */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span className="telemetry-label">SYNTHETIC PROBABILITY</span>
          <span className="telemetry-value" style={{ color: syntheticProbability > 50 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
            {syntheticProbability}%
          </span>
        </div>

        <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span className="telemetry-label">VOICE AUTHENTICITY</span>
          <span className="telemetry-value" style={{ color: authenticity < 50 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
            {authenticity}%
          </span>
        </div>

        <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span className="telemetry-label">MODEL CONFIDENCE</span>
          <span className="telemetry-value" style={{ color: 'var(--accent-teal)' }}>
            {confidence}%
          </span>
        </div>

        <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span className="telemetry-label">SYSTEM VERDICT</span>
          <span className="telemetry-value" style={{ color: recommendedAction === 'HOLD' ? 'var(--risk-high)' : recommendedAction === 'VERIFY' ? 'var(--risk-medium)' : 'var(--risk-low)' }}>
            {recommendedAction}
          </span>
        </div>
      </div>

      {/* Pipeline Stage Indicators */}
      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
        INSPECTION PIPELINE MODULES
      </h4>

      <div className="grid-2">
        {stages.map((stage, idx) => (
          <div key={idx} style={{ 
            background: 'var(--bg-card-alt)', 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyLink: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {stage.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {stage.desc}
              </div>
            </div>

            <div>
              {stage.status === 'FLAGGED' && (
                <span className="badge-high">FLAGGED</span>
              )}
              {stage.status === 'WARN' && (
                <span className="badge-medium">ATTENTION</span>
              )}
              {stage.status === 'PASS' && (
                <span className="badge-low">PASS</span>
              )}
              {stage.status === 'ACTIVE' && (
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  ONLINE
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
