import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export const RiskCard = () => {
  const { 
    scenario, 
    riskScore, 
    syntheticProbability, 
    authenticity, 
    confidence, 
    riskLevel, 
    recommendedAction 
  } = useGlobalRisk();

  const getActionColor = () => {
    if (recommendedAction === 'HOLD') return 'var(--risk-high)';
    if (recommendedAction === 'VERIFY') return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  const getActionIcon = () => {
    if (recommendedAction === 'HOLD') return <ShieldAlert size={24} style={{ color: 'var(--risk-high)' }} />;
    if (recommendedAction === 'VERIFY') return <AlertTriangle size={24} style={{ color: 'var(--risk-medium)' }} />;
    return <ShieldCheck size={24} style={{ color: 'var(--risk-low)' }} />;
  };

  return (
    <div className="card" style={{ background: '#ffffff' }}>
      <div className="card-header">
        <h3 className="card-title">
          <Activity size={18} style={{ color: 'var(--accent-teal)' }} />
          RISK & DECISION ENGINE SUMMARY
        </h3>
        <span className="telemetry-label" style={{ fontFamily: 'var(--font-mono)' }}>
          SCENARIO: <strong style={{ color: 'var(--text-main)' }}>{scenario}</strong>
        </span>
      </div>

      <div className="grid-3" style={{ alignItems: 'stretch' }}>
        {/* Risk Score Gauge */}
        <div style={{ background: 'var(--bg-card-alt)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="telemetry-label">DYNAMIC RISK SCORE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: getActionColor() }}>
              {riskScore}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>/ 100</span>
          </div>

          {/* Score Bar */}
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '0.8rem', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${riskScore}%`, 
                background: getActionColor(), 
                transition: 'width 0.4s ease, background-color 0.4s ease' 
              }} 
            />
          </div>
        </div>

        {/* Decision & Action */}
        <div style={{ background: 'var(--bg-card-alt)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="telemetry-label">DECISION ENGINE ACTION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
            {getActionIcon()}
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: getActionColor() }}>
                {recommendedAction}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                LEVEL: {riskLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div style={{ background: 'var(--bg-card-alt)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synthetic Probability:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: syntheticProbability > 50 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
              {syntheticProbability}%
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voice Authenticity:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: authenticity < 50 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
              {authenticity}%
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analysis Confidence:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)' }}>
              {confidence}%
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
