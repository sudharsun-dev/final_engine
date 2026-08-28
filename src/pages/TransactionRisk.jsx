import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { CreditCard, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const TransactionRisk = () => {
  const { scenario, riskScore, recommendedAction } = useGlobalRisk();

  const transactions = [
    { id: 'TXN-9841', type: 'Wire Transfer ($25,000)', channel: 'Voice Banking', riskThreshold: 50 },
    { id: 'TXN-9842', type: 'Beneficiary Addition', channel: 'IVR Voice Bot', riskThreshold: 40 },
    { id: 'TXN-9843', type: 'Password Reset', channel: 'Contact Center', riskThreshold: 30 },
    { id: 'TXN-9844', type: 'Balance Inquiry', channel: 'Mobile Voice Assistant', riskThreshold: 80 }
  ];

  return (
    <div className="transaction-risk-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <CreditCard size={20} style={{ color: 'var(--accent-blue)' }} />
            REAL-TIME TRANSACTION RISK EVALUATOR
          </h2>
          <StatusBadge scenario={scenario} />
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Combines voice authenticity scores with sensitive financial transaction authorization policies.
        </p>
      </div>

      {/* Active Global Risk Summary */}
      <div className="card" style={{ background: scenario === 'HIGH' ? '#fef2f2' : scenario === 'MEDIUM' ? '#fffbeb' : '#f0fdf4', borderColor: scenario === 'HIGH' ? '#fecaca' : scenario === 'MEDIUM' ? '#fef08a' : '#bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              CURRENT RISK EVALUATION
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              GLOBAL SCORE: {riskScore} / 100 — ACTION: {recommendedAction}
            </div>
          </div>

          <div>
            {recommendedAction === 'HOLD' && (
              <span className="badge-high" style={{ fontSize: '0.95rem', padding: '0.4rem 0.8rem' }}>
                ALL HIGH-VALUE TRANSACTIONS FROZEN
              </span>
            )}
            {recommendedAction === 'VERIFY' && (
              <span className="badge-medium" style={{ fontSize: '0.95rem', padding: '0.4rem 0.8rem' }}>
                MANDATORY STEP-UP MFA REQUIRED
              </span>
            )}
            {recommendedAction === 'CONTINUE' && (
              <span className="badge-low" style={{ fontSize: '0.95rem', padding: '0.4rem 0.8rem' }}>
                TRANSACTIONS AUTO-APPROVED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Policy Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>SENSITIVE TRANSACTION AUTHORIZATION STATUS</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>TRANSACTION ID</th>
              <th>TRANSACTION TYPE</th>
              <th>CHANNEL</th>
              <th>RISK THRESHOLD</th>
              <th>EVALUATED ACTION</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isBlocked = riskScore >= tx.riskThreshold;
              return (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{tx.id}</td>
                  <td>{tx.type}</td>
                  <td>{tx.channel}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>Score &ge; {tx.riskThreshold}</td>
                  <td>
                    {isBlocked ? (
                      <span className={scenario === 'HIGH' ? 'badge-high' : 'badge-medium'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldAlert size={12} /> {recommendedAction === 'HOLD' ? 'BLOCKED / HOLD' : 'STEP-UP VERIFY'}
                      </span>
                    ) : (
                      <span className="badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle size={12} /> APPROVED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
