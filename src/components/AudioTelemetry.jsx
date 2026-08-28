import React from 'react';
import { Cpu, Wifi, HardDrive, Zap } from 'lucide-react';

export const AudioTelemetry = ({ telemetry }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Cpu size={18} style={{ color: 'var(--accent-teal)' }} />
          AUDIO STREAM & HARDWARE TELEMETRY
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          DSP ENGINE v2.0
        </span>
      </div>

      <div className="telemetry-grid">
        <div className="telemetry-item">
          <span className="telemetry-label">MICROPHONE STATUS</span>
          <span className="telemetry-value" style={{ color: telemetry.isAnalyzing ? 'var(--risk-low)' : 'var(--risk-high)' }}>
            {telemetry.isAnalyzing ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">SAMPLE RATE</span>
          <span className="telemetry-value">{telemetry.sampleRate} Hz</span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">AUDIO CHANNELS</span>
          <span className="telemetry-value">1 MONO</span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">SIGNAL RMS</span>
          <span className="telemetry-value" style={{ color: 'var(--accent-blue)' }}>{telemetry.rms}</span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">SIGNAL PEAK</span>
          <span className="telemetry-value" style={{ color: telemetry.peak > 0.8 ? 'var(--risk-high)' : 'var(--text-main)' }}>
            {telemetry.peak}
          </span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">AUDIO LEVEL</span>
          <span className="telemetry-value">{telemetry.audioLevel}%</span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">ANALYSIS WINDOW</span>
          <span className="telemetry-value" style={{ color: 'var(--accent-teal)' }}>
            #{telemetry.windowCount}
          </span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">AUDIO QUALITY</span>
          <span className="telemetry-value" style={{ fontSize: '0.9rem' }}>{telemetry.quality}</span>
        </div>
      </div>

      {/* Explicit Audio Data Rate vs Network Uplink Distinction */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Wifi size={16} style={{ color: 'var(--accent-blue)' }} />
          AUDIO BANDWIDTH & STREAM THROUGHPUT
        </h4>

        <div className="grid-4">
          <div style={{ background: 'var(--bg-card-alt)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>RAW AUDIO DATA RATE</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--accent-teal)' }}>{telemetry.pcmBitRate}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', display: 'block', marginTop: '0.2rem' }}>Calculated local PCM</span>
          </div>

          <div style={{ background: 'var(--bg-card-alt)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>NETWORK UPLINK</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--accent-blue)' }}>{telemetry.uplinkRate}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', display: 'block', marginTop: '0.2rem' }}>Supabase realtime frames</span>
          </div>

          <div style={{ background: 'var(--bg-card-alt)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>WINDOW SAMPLES</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-main)' }}>{telemetry.windowSize}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', display: 'block', marginTop: '0.2rem' }}>40k samples @ 16kHz</span>
          </div>

          <div style={{ background: 'var(--bg-card-alt)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>WINDOW DURATION</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-main)' }}>{telemetry.windowDuration}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', display: 'block', marginTop: '0.2rem' }}>Target analysis block</span>
          </div>
        </div>
      </div>
    </div>
  );
};
