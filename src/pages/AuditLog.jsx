import React, { useState, useEffect } from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { fetchAuditLogs } from '../services/globalRiskService';
import { List, RefreshCw, Smartphone, Monitor } from 'lucide-react';

export const AuditLog = () => {
  const { scenario, updatedAt } = useGlobalRisk();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAuditLogs(30);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [scenario, updatedAt]);

  return (
    <div className="audit-log-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <List size={20} style={{ color: 'var(--accent-indigo)' }} />
            GLOBAL SCENARIO AUDIT LOG & CROSS-DEVICE TRAIL
          </h2>
          <button onClick={loadData} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh Audit Trail
          </button>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Immutable log of all global risk scenario changes broadcast across connected devices.
        </p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>CLIENT / DEVICE</th>
              <th>TRANSITION</th>
              <th>SCENARIO</th>
              <th>RISK SCORE</th>
              <th>ACTION ENFORCED</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {log.device_session?.includes('Mobile') ? (
                      <Smartphone size={14} style={{ color: 'var(--accent-teal)' }} />
                    ) : (
                      <Monitor size={14} style={{ color: 'var(--accent-blue)' }} />
                    )}
                    <span>{log.device_session || 'Desktop Browser'}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                    {log.previous_state || 'UNKNOWN'} &rarr; <strong style={{ color: log.new_state === 'HIGH' ? 'var(--risk-high)' : log.new_state === 'MEDIUM' ? 'var(--risk-medium)' : 'var(--risk-low)' }}>{log.new_state}</strong>
                  </td>
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
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Fetching audit logs from Supabase...' : 'No audit records found. Try switching scenario states in API Keys & Control.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
