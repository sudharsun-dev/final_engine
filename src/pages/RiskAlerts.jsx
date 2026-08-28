import React, { useEffect, useState } from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { fetchAuditLogs } from '../services/globalRiskService';
import { AlertTriangle, ShieldAlert, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const RiskAlerts = () => {
  const { scenario, riskScore, recommendedAction, updatedAt } = useGlobalRisk();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogs(15);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [scenario, updatedAt]);

  return (
    <div className="risk-alerts-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <AlertTriangle size={20} style={{ color: 'var(--risk-medium)' }} />
            RISK ALERTS & VERIFICATION ACTION CENTER
          </h2>
          <StatusBadge scenario={scenario} />
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Real-time threat notification, step-up authentication routing, and scenario transition logs.
        </p>
      </div>

      {/* Real-time Alert Banner */}
      {scenario === 'HIGH' && (
        <div className="card" style={{ background: '#fee2e2', borderColor: '#fca5a5', borderLeft: '6px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={36} style={{ color: '#dc2626', flexShrink: 0 }} />
            <div>
              <h3 style={{ color: '#991b1b', fontSize: '1.2rem', fontWeight: '800' }}>
                CRITICAL ALERT: HIGH RISK VOICE CLONE DETECTED
              </h3>
              <p style={{ color: '#7f1d1d', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                DYNAMIC RISK SCORE: 95/100 — ACTION: <strong>HOLD / INDEPENDENT VERIFICATION</strong>
              </p>
              <p style={{ color: '#991b1b', fontSize: '0.78rem', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                All automated voice transactions are suspended immediately. Escalate session to Security Operations Center (SOC).
              </p>
            </div>
          </div>
        </div>
      )}

      {scenario === 'MEDIUM' && (
        <div className="card" style={{ background: '#fef3c7', borderColor: '#fde047', borderLeft: '6px solid #d97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={36} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <h3 style={{ color: '#92400e', fontSize: '1.2rem', fontWeight: '800' }}>
                WARNING: ELEVATED VOICE ANOMALY DETECTED
              </h3>
              <p style={{ color: '#78350f', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                DYNAMIC RISK SCORE: 55/100 — ACTION: <strong>STEP-UP VERIFICATION REQUIRED</strong>
              </p>
              <p style={{ color: '#92400e', fontSize: '0.78rem', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                Prompt user for secondary out-of-band factor (SMS OTP or Hardware Key) before allowing transaction execution.
              </p>
            </div>
          </div>
        </div>
      )}

      {scenario === 'LOW' && (
        <div className="card" style={{ background: '#dcfce7', borderColor: '#86efac', borderLeft: '6px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheck size={36} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <h3 style={{ color: '#14532d', fontSize: '1.2rem', fontWeight: '800' }}>
                SYSTEM SECURE: LOW VOICE RISK
              </h3>
              <p style={{ color: '#166534', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                DYNAMIC RISK SCORE: 15/100 — ACTION: <strong>CONTINUE NORMAL PROCESSING</strong>
              </p>
              <p style={{ color: '#14532d', fontSize: '0.78rem', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                Voice pattern matches authentic baseline. Continuous background telemetry monitoring remains active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Change History Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={18} style={{ color: 'var(--accent-teal)' }} />
            REAL-TIME CONTROL TRANSITION EVENT HISTORY
          </h3>
          <button onClick={loadLogs} className="btn" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>
            <RefreshCw size={12} /> Refresh Logs
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>DEVICE / SESSION</th>
              <th>PREVIOUS STATE</th>
              <th>NEW SCENARIO</th>
              <th>RISK SCORE</th>
              <th>RECOMMENDED ACTION</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td>{log.device_session || 'Connected Client'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{log.previous_state || 'N/A'}</td>
                  <td>
                    <span className={log.new_state === 'HIGH' ? 'badge-high' : log.new_state === 'MEDIUM' ? 'badge-medium' : 'badge-low'}>
                      {log.new_state}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{log.risk_score}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{log.action}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                  {loading ? 'Loading audit event history...' : 'No scenario changes recorded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
