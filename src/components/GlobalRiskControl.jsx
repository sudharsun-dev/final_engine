import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { RefreshCw, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export const GlobalRiskControl = ({ compact = false }) => {
  const { scenario, isUpdating, updateError, updateScenario, isConfigured } = useGlobalRisk();

  const handleSelect = (newScenario) => {
    if (newScenario === scenario || isUpdating) return;
    updateScenario(newScenario);
  };

  return (
    <div className={`card ${compact ? 'compact-control' : ''}`} style={{ borderColor: 'var(--border-dark)', background: '#0b132b', color: '#fff' }}>
      <div className="card-header" style={{ borderBottomColor: '#1e293b' }}>
        <h3 className="card-title" style={{ color: '#fff' }}>
          <ShieldAlert size={18} style={{ color: '#38bdf8' }} />
          GLOBAL RISK SCENARIO CONTROLLER
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          {isUpdating ? (
            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={14} className="spin" /> UPDATING DB...
            </span>
          ) : (
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> GLOBAL / SYNCED
            </span>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div className="alert-banner warning" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>Supabase credentials unconfigured. Operating in local simulation mode.</span>
        </div>
      )}

      {updateError && (
        <div className="alert-banner error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>Error updating database: {updateError}</span>
        </div>
      )}

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem' }}>
        Select a global risk scenario. Every connected System 2 device across browsers and mobile will synchronize instantly via Supabase Realtime.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleSelect('LOW')}
          disabled={isUpdating}
          className={`btn-scenario low ${scenario === 'LOW' ? 'active' : ''}`}
        >
          {scenario === 'LOW' ? '✓ LOW (15)' : 'LOW (15)'}
        </button>

        <button
          onClick={() => handleSelect('MEDIUM')}
          disabled={isUpdating}
          className={`btn-scenario medium ${scenario === 'MEDIUM' ? 'active' : ''}`}
        >
          {scenario === 'MEDIUM' ? '✓ MEDIUM (55)' : 'MEDIUM (55)'}
        </button>

        <button
          onClick={() => handleSelect('HIGH')}
          disabled={isUpdating}
          className={`btn-scenario high ${scenario === 'HIGH' ? 'active' : ''}`}
        >
          {scenario === 'HIGH' ? '✓ HIGH (95)' : 'HIGH (95)'}
        </button>
      </div>

      <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #1e293b', fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
        <span>ACTIVE DB SCENARIO: <strong style={{ color: '#38bdf8' }}>{scenario}</strong></span>
        <span>SINGLE SOURCE OF TRUTH: <strong style={{ color: '#22c55e' }}>system2_control (id=1)</strong></span>
      </div>
    </div>
  );
};
