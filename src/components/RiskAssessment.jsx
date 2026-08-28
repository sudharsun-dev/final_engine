import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { Shield, UserCheck, AlertOctagon, MapPin, Activity, ShieldAlert } from 'lucide-react';

export const RiskAssessment = () => {
  const { scenario, riskScore } = useGlobalRisk();

  const signals = [
    {
      title: 'IDENTITY SIGNALS',
      icon: <UserCheck size={16} style={{ color: 'var(--accent-blue)' }} />,
      items: [
        { name: 'Caller Voice Match', status: scenario === 'HIGH' ? 'Mismatch (0.05)' : 'Matched (0.95)' },
        { name: 'Known Identity DB', status: 'Verified' },
        { name: 'Historical Voice Consistency', status: scenario === 'HIGH' ? 'Inconsistent' : 'Consistent' },
        { name: 'Device Reputation', status: 'Good Standing' }
      ]
    },
    {
      title: 'REQUEST SIGNALS',
      icon: <AlertOctagon size={16} style={{ color: 'var(--accent-teal)' }} />,
      items: [
        { name: 'Requested Operation', status: scenario === 'HIGH' ? 'High-Value Transfer' : 'Balance Inquiry' },
        { name: 'Sensitive Action Trigger', status: scenario === 'HIGH' ? 'Yes (Fund Drain)' : 'No' },
        { name: 'Urgency & Pressure', status: scenario === 'HIGH' ? 'Elevated' : 'Normal' },
        { name: 'Social Engineering Pattern', status: scenario === 'HIGH' ? 'Detected' : 'None' }
      ]
    },
    {
      title: 'CONTEXT SIGNALS',
      icon: <MapPin size={16} style={{ color: 'var(--accent-indigo)' }} />,
      items: [
        { name: 'Call Origin Network', status: 'VoIP Gateway' },
        { name: 'Geo-Location Mismatch', status: scenario === 'HIGH' ? 'Cross-Border' : 'Local' },
        { name: 'Time of Day Context', status: 'Business Hours' },
        { name: 'Session Duration', status: '03:45 mins' }
      ]
    },
    {
      title: 'BEHAVIOR SIGNALS',
      icon: <Activity size={16} style={{ color: 'var(--risk-medium)' }} />,
      items: [
        { name: 'Speech Cadence Variance', status: scenario === 'HIGH' ? 'Robotic Artifacts' : 'Natural' },
        { name: 'Unusual Pauses / Latency', status: scenario === 'HIGH' ? 'Elevated (AI Buffer)' : 'Normal' },
        { name: 'Emotion & Tone Pitch', status: scenario === 'HIGH' ? 'Flat Synthetic' : 'Natural Dynamic' },
        { name: 'Session Behavior', status: 'Monitored' }
      ]
    },
    {
      title: 'EXTERNAL RISK SIGNALS',
      icon: <ShieldAlert size={16} style={{ color: 'var(--risk-high)' }} />,
      items: [
        { name: 'Blacklist Database', status: scenario === 'HIGH' ? 'Flagged Number' : 'Clean' },
        { name: 'Threat Intelligence', status: 'Active Watchlist' },
        { name: 'Reported Scams', status: scenario === 'HIGH' ? 'Matches Campaign' : 'None' },
        { name: 'Carrier Risk Rating', status: 'Low Risk' }
      ]
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Shield size={18} style={{ color: 'var(--accent-blue)' }} />
          MULTI-SIGNAL ANALYSIS & ADAPTIVE RISK ENGINE
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          COMBINED SCORE: <strong style={{ color: riskScore > 50 ? 'var(--risk-high)' : 'var(--risk-low)' }}>{riskScore} / 100</strong>
        </span>
      </div>

      {/* Signal Cards */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {signals.slice(0, 3).map((sig, idx) => (
          <div key={idx} className="signal-card">
            <div className="signal-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {sig.icon}
              <span>{sig.title}</span>
            </div>
            <ul className="signal-list">
              {sig.items.map((item, itemIdx) => (
                <li key={itemIdx} className="signal-item">
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{item.status}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {signals.slice(3, 5).map((sig, idx) => (
          <div key={idx} className="signal-card">
            <div className="signal-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {sig.icon}
              <span>{sig.title}</span>
            </div>
            <ul className="signal-list">
              {sig.items.map((item, itemIdx) => (
                <li key={itemIdx} className="signal-item">
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{item.status}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
