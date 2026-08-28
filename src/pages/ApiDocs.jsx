import React from 'react';
import { GlobalRiskControl } from '../components/GlobalRiskControl';
import { Key, Code, Database, Radio, Info } from 'lucide-react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';

export const ApiDocs = () => {
  const { connectionStatus, isConfigured } = useGlobalRisk();

  return (
    <div className="api-docs-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Key size={20} style={{ color: 'var(--accent-teal)' }} />
            API KEYS, DOCUMENTATION & OPERATOR CONTROL
          </h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Developer integration endpoints, Supabase configuration status, and global test operator controls.
        </p>
      </div>

      {/* Primary Global Risk Scenario Controller Location */}
      <GlobalRiskControl />

      {/* Honest Prototype Labeling Disclaimer */}
      <div className="card" style={{ background: '#f8fafc', borderLeft: '4px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
              PROTOTYPE SCENARIO CONTROL & AI DEEPFAKE MODEL INTEGRATION NOTE
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              The <strong>LOW / MEDIUM / HIGH</strong> scenario buttons above control the global demonstration state stored in Supabase. The live Web Audio API microphone analyzer captures real audio and renders real time-domain waveforms. When a production deepfake AI model is integrated, its inferencing output replaces the manual scenario control seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Connection & Configuration Info */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>SUPABASE INFRASTRUCTURE STATUS</h3>
        
        <div className="telemetry-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="telemetry-item">
            <span className="telemetry-label">SUPABASE CONNECTION</span>
            <span className="telemetry-value" style={{ color: isConfigured ? 'var(--risk-low)' : 'var(--risk-high)' }}>
              {isConfigured ? 'CONNECTED' : 'UNCONFIGURED'}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">REALTIME REPLICATION</span>
            <span className="telemetry-value" style={{ color: connectionStatus === 'CONNECTED' ? 'var(--risk-low)' : 'var(--risk-medium)' }}>
              {connectionStatus}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">DATABASE TABLE</span>
            <span className="telemetry-value" style={{ fontSize: '0.9rem' }}>public.system2_control</span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">SERVICE ROLE KEY</span>
            <span className="telemetry-value" style={{ color: 'var(--risk-low)', fontSize: '0.85rem' }}>SECURE (NOT EXPOSED)</span>
          </div>
        </div>

        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Code size={16} /> REST API ENDPOINTS FOR INTEGRATION
        </h4>

        <div style={{ background: '#090d16', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
          <div style={{ color: '#94a3b8', marginBottom: '0.4rem' }}>// GET Active Risk State</div>
          <div>GET https://{import.meta.env.VITE_SUPABASE_URL || 'your-supabase-id.supabase.co'}/rest/v1/system2_control?id=eq.1</div>
          
          <div style={{ color: '#94a3b8', margin: '0.8rem 0 0.4rem 0' }}>// Realtime WebSocket Channel</div>
          <div>wss://{import.meta.env.VITE_SUPABASE_URL || 'your-supabase-id.supabase.co'}/realtime/v1/websocket</div>
        </div>
      </div>
    </div>
  );
};
