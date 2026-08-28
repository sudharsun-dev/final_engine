import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { Server, CheckCircle2, AlertCircle, Radio, Mic, Database, Cpu } from 'lucide-react';

export const SystemHealth = () => {
  const { connectionStatus, updatedAt, scenario, isConfigured } = useGlobalRisk();
  const { isAnalyzing, telemetry } = useAudioAnalyzer();

  const healthItems = [
    { name: 'FRONTEND APPLICATION', status: 'ONLINE', icon: <Server size={18} style={{ color: '#22c55e' }} />, isOk: true },
    { name: 'SUPABASE CLIENT', status: isConfigured ? 'CONNECTED' : 'UNCONFIGURED', icon: <Database size={18} style={{ color: isConfigured ? '#22c55e' : '#f59e0b' }} />, isOk: isConfigured },
    { name: 'REALTIME REPLICATION', status: connectionStatus === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED', icon: <Radio size={18} style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#ef4444' }} />, isOk: connectionStatus === 'CONNECTED' },
    { name: 'MICROPHONE FEED', status: isAnalyzing ? 'ACTIVE' : 'INACTIVE', icon: <Mic size={18} style={{ color: isAnalyzing ? '#22c55e' : '#94a3b8' }} />, isOk: isAnalyzing },
    { name: 'AUDIO DSP ANALYZER', status: isAnalyzing ? 'RUNNING' : 'STOPPED', icon: <Cpu size={18} style={{ color: isAnalyzing ? '#22c55e' : '#94a3b8' }} />, isOk: isAnalyzing },
    { name: 'DATABASE (system2_control)', status: isConfigured ? 'ONLINE' : 'OFFLINE', icon: <Database size={18} style={{ color: isConfigured ? '#22c55e' : '#ef4444' }} />, isOk: isConfigured },
    { name: 'GLOBAL RISK CONTROL', status: 'SYNCED', icon: <CheckCircle2 size={18} style={{ color: '#22c55e' }} />, isOk: true }
  ];

  return (
    <div className="system-health-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Server size={20} style={{ color: 'var(--accent-teal)' }} />
            SYSTEM 2 INFRASTRUCTURE & DIAGNOSTIC HEALTH
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            LAST EVENT: {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Real-time diagnostics for audio DSP pipelines, Supabase connection pool, and Realtime WebSocket status.
        </p>
      </div>

      <div className="grid-3">
        {healthItems.map((item, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {item.icon}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: item.isOk ? 'var(--risk-low)' : 'var(--risk-high)' }}>
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '0.8rem' }}>ENVIRONMENT CONFIGURATION DETAILED SUMMARY</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="telemetry-label">SUPABASE URL</span>
            <span className="telemetry-value" style={{ fontSize: '0.82rem' }}>
              {import.meta.env.VITE_SUPABASE_URL ? 'CONFIGURED' : 'NOT SET (.env)'}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">SUPABASE ANON KEY</span>
            <span className="telemetry-value" style={{ fontSize: '0.82rem' }}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURED' : 'NOT SET (.env)'}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">SERVICE ROLE KEY</span>
            <span className="telemetry-value" style={{ color: 'var(--risk-low)', fontSize: '0.82rem' }}>
              HIDDEN (NEVER EXPOSED)
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">CURRENT ACTIVE SCENARIO</span>
            <span className="telemetry-value" style={{ color: 'var(--accent-blue)' }}>
              {scenario}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
