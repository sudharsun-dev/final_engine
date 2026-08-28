import React from 'react';
import { GitCommit, ArrowRight, ShieldCheck, Lock, Cpu, Layers, BarChart, Bell, Server } from 'lucide-react';

export const Pipeline = () => {
  const steps = [
    { num: '01', title: 'Call Input Layer', sub: 'Live VoIP / Microphone Capture' },
    { num: '02', title: 'Privacy & Security Gate', sub: 'In-Memory Buffer & Encryption' },
    { num: '03', title: 'AI Voice Authenticity Engine', sub: 'Spectral, Prosody & Clone Detection' },
    { num: '04', title: 'Multi-Signal Analysis', sub: 'Identity, Context, Request & Behavior' },
    { num: '05', title: 'Adaptive Risk Engine', sub: 'Dynamic Weighting & Fusion' },
    { num: '06', title: 'Dynamic Risk Scoring', sub: 'Deterministic Score (0-100)' },
    { num: '07', title: 'Decision Engine', sub: 'Action Selection (CONTINUE/VERIFY/HOLD)' },
    { num: '08', title: 'Action & Alerting', sub: 'Realtime Alerts & Verification' },
    { num: '09', title: 'Enterprise & API Integration', sub: 'Webhooks, Banking & SOC' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <GitCommit size={18} style={{ color: 'var(--accent-teal)' }} />
          SYSTEM 2 END-TO-END DETECTION ARCHITECTURE
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          13-STAGE ENTERPRISE PIPELINE
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div style={{ 
              background: 'var(--bg-card-alt)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.75rem 0.9rem', 
              minWidth: '170px',
              flex: '1 1 170px',
              maxWidth: '220px'
            }}>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)', fontWeight: '700' }}>
                STAGE {step.num}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-main)', margin: '0.15rem 0' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {step.sub}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <ArrowRight size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
