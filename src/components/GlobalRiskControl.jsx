import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { RefreshCw, CheckCircle2, AlertCircle, Sliders, AlertTriangle } from 'lucide-react';

export const GlobalRiskControl = ({ compact = false }) => {
  const { 
    scenario, 
    riskScore, 
    updatedAt, 
    isUpdating, 
    updateError, 
    syncStatus,
    updateScenario, 
    isConfigured 
  } = useGlobalRisk();

  const handleSelect = (newScenario) => {
    if (newScenario === scenario || isUpdating) return;
    updateScenario(newScenario);
  };

  const renderStatusBadge = () => {
    if (isUpdating || syncStatus === 'SYNCING') {
      return (
        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
          <RefreshCw size={13} className="spin" /> SYNCING...
        </span>
      );
    }
    if (updateError || syncStatus === 'ERROR') {
      return (
        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
          <AlertCircle size={13} /> ERROR (WRITE FAILED)
        </span>
      );
    }
    if (!isConfigured) {
      return (
        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
          <AlertTriangle size={13} /> UNCONFIGURED (.ENV)
        </span>
      );
    }
    return (
      <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
        <CheckCircle2 size={13} /> SYNCED
      </span>
    );
  };

  return (
    <div className="card" style={{ background: '#0b132b', color: '#ffffff', borderColor: updateError ? '#ef4444' : '#1e293b', padding: '1.1rem 1.25rem' }}>
      <div className="card-header" style={{ borderBottomColor: '#1e293b', marginBottom: '0.85rem', paddingBottom: '0.6rem' }}>
        <h3 className="card-title" style={{ color: '#ffffff', fontSize: '0.95rem' }}>
          <Sliders size={16} style={{ color: '#38bdf8' }} />
          GLOBAL RISK SCENARIO
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          {renderStatusBadge()}
        </div>
      </div>

      {!isConfigured && (
        <div className="alert-banner warning" style={{ marginBottom: '0.8rem', padding: '0.6rem 0.9rem', fontSize: '0.82rem', background: '#451a03', borderColor: '#b45309', color: '#fde68a' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>VITE_SUPABASE_URL is unconfigured. Please set build-time environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel project settings and rebuild.</span>
        </div>
      )}

      {updateError && (
        <div className="alert-banner error" style={{ marginBottom: '0.8rem', padding: '0.6rem 0.9rem', fontSize: '0.82rem', background: '#450a0a', borderColor: '#991b1b', color: '#fca5a5' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.1rem' }}>Database Write Error:</strong>
            <span>{updateError}</span>
          </div>
        </div>
      )}

      {/* Segmented Control Selector */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <button
          onClick={() => handleSelect('LOW')}
          disabled={isUpdating}
          className={`btn-scenario low ${scenario === 'LOW' ? 'active' : ''}`}
          style={{ padding: '0.55rem 0.8rem', fontSize: '0.88rem' }}
        >
          {scenario === 'LOW' ? '● LOW (15)' : '○ LOW (15)'}
        </button>

        <button
          onClick={() => handleSelect('MEDIUM')}
          disabled={isUpdating}
          className={`btn-scenario medium ${scenario === 'MEDIUM' ? 'active' : ''}`}
          style={{ padding: '0.55rem 0.8rem', fontSize: '0.88rem' }}
        >
          {scenario === 'MEDIUM' ? '● MEDIUM (55)' : '○ MEDIUM (55)'}
        </button>

        <button
          onClick={() => handleSelect('HIGH')}
          disabled={isUpdating}
          className={`btn-scenario high ${scenario === 'HIGH' ? 'active' : ''}`}
          style={{ padding: '0.55rem 0.8rem', fontSize: '0.88rem' }}
        >
          {scenario === 'HIGH' ? '● HIGH (95)' : '○ HIGH (95)'}
        </button>
      </div>

      {/* Status Details Bar */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid #1e293b',
        fontSize: '0.74rem',
        color: '#64748b',
        fontFamily: 'var(--font-mono)'
      }}>
        <span>DATABASE: <strong style={{ color: isConfigured ? '#22c55e' : '#f59e0b' }}>{isConfigured ? 'CONNECTED' : 'UNCONFIGURED'}</strong></span>
        <span>CURRENT STATE: <strong style={{ color: '#38bdf8' }}>{scenario} ({riskScore}/100)</strong></span>
        <span>LAST UPDATED: <strong style={{ color: '#94a3b8' }}>{updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'N/A'}</strong></span>
      </div>
    </div>
  );
};
