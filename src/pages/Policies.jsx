import React from 'react';
import { FileText, Shield, Lock, AlertCircle } from 'lucide-react';

export const Policies = () => {
  const policyRules = [
    { level: 'LOW', threshold: '0 – 30', action: 'CONTINUE', description: 'Voice match within normal parameters. Auto-approve low and medium value operations.' },
    { level: 'MEDIUM', threshold: '31 – 70', action: 'VERIFY', description: 'Synthetic artifact anomaly detected. Trigger mandatory out-of-band step-up authentication.' },
    { level: 'HIGH', threshold: '71 – 100', action: 'HOLD', description: 'Deepfake / voice impersonation detected. Immediately freeze all account privileges and log alert.' }
  ];

  return (
    <div className="policies-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileText size={20} style={{ color: 'var(--accent-teal)' }} />
            SYSTEM 2 SECURITY POLICIES & THRESHOLDS
          </h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Automated governance rules for voice fraud risk classification and enforcement actions.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>RISK SCORING THRESHOLD MATRIX</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>RISK LEVEL</th>
              <th>SCORE RANGE</th>
              <th>ENFORCEMENT ACTION</th>
              <th>POLICY DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {policyRules.map((rule, idx) => (
              <tr key={idx}>
                <td>
                  <span className={rule.level === 'HIGH' ? 'badge-high' : rule.level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}>
                    {rule.level}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{rule.threshold}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{rule.action}</td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{rule.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
