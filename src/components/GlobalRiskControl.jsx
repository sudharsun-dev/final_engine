import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { RefreshCw, CheckCircle2, AlertCircle, Sliders, Database, Radio } from 'lucide-react';

export const GlobalRiskControl = ({ compact = false }) => {
  const { 
    scenario, 
    riskScore, 
    updatedAt, 
    updatedBy, 
    isUpdating, 
    updateError, 
    updateScenario, 
    connectionStatus, 
    isConfigured 
  } = useGlobalRisk();

  const handleSelect = (newScenario) => {
    if (newScenario === scenario || isUpdating) return;
    updateScenario(newScenario);
  };

  return (
    <div className="card" style={{ background: '#0b132b', color: '#ffffff', borderColor: '#1e293b', padding: '1.1rem 1.25rem' }}>
      <div className="card-header" style={{ borderBottomColor: '#1e293b', marginBottom: '0.85rem', paddingBottom: '0.6rem' }}>
        <h3 className="card-title" style={{ color: '#ffffff', fontSize: '0.95rem' }}>
          <Sliders size={16} style={{ color: '#38bdf8' }} />
          GLOBAL RISK SCENARIO
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          {isUpdating ? (
            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={13} className="spin" /> UPDATING...
            </span>
          ) : (
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> REALTIME SYNC
            </span>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div className="alert-banner warning" style={{ marginBottom: '0.8rem', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}>
          <AlertCircle size={14} />
          <span>Supabase credentials unconfigured (.env). Operating in local simulation broadcast.</span>
        </div>
      )}

      {updateError && (
        <div className="alert-banner error" style={{ marginBottom: '0.8rem', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}>
          <AlertCircle size={14} />
          <span>Error updating database: {updateError}</span>
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
        <span>DATABASE: <strong style={{ color: isConfigured ? '#22c55e' : '#f59e0b' }}>{isConfigured ? 'CONNECTED' : 'LOCAL'}</strong></span>
        <span>REALTIME: <strong style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#f59e0b' }}>{connectionStatus}</strong></span>
        <span>CURRENT STATE: <strong style={{ color: '#38bdf8' }}>{scenario} ({riskScore}/100)</strong></span>
        <span>LAST UPDATED: <strong style={{ color: '#94a3b8' }}>{updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'N/A'}</strong></span>
      </div>
    </div>
  );
};
