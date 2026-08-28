import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  CreditCard, 
  AlertTriangle, 
  FileText, 
  List, 
  Server, 
  Key, 
  Radio 
} from 'lucide-react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';

export const Header = () => {
  const { scenario, riskScore, connectionStatus, updateScenario } = useGlobalRisk();

  const getScenarioBadgeStyle = () => {
    if (scenario === 'HIGH') return 'badge-high';
    if (scenario === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-brand">
          <img src="/logo.png" alt="Nirbhaya Sanchar Logo" className="brand-logo-img" />
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-title">NIRBHAYA SANCHAR</span>
              <span className="system-badge">SYSTEM 2</span>
            </div>
            <span className="brand-subtitle">Secure Voice Communication & Authenticity Engine</span>
          </div>
        </div>

        <div className="header-status-bar">
          <div className="status-indicator">
            <Radio size={14} className="animate-pulse" style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#f59e0b' }} />
            <span>SUPABASE REALTIME:</span>
            <span className={`status-dot ${connectionStatus === 'CONNECTED' ? 'online' : 'offline'}`}></span>
            <span>{connectionStatus}</span>
          </div>

          <div style={{ height: '16px', width: '1px', background: '#334155' }}></div>

          <div className="status-indicator" style={{ gap: '0.6rem' }}>
            <span>GLOBAL SCENARIO:</span>
            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
              <button
                onClick={() => updateScenario('LOW')}
                style={{
                  background: scenario === 'LOW' ? '#16a34a' : '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                LOW
              </button>
              <button
                onClick={() => updateScenario('MEDIUM')}
                style={{
                  background: scenario === 'MEDIUM' ? '#d97706' : '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                MED
              </button>
              <button
                onClick={() => updateScenario('HIGH')}
                style={{
                  background: scenario === 'HIGH' ? '#dc2626' : '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                HIGH
              </button>
            </div>
            <span className={getScenarioBadgeStyle()}>{scenario} ({riskScore})</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="nav-container">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/live-analysis" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={16} />
            <span>Live Analysis</span>
          </NavLink>
          <NavLink to="/transaction-risk" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CreditCard size={16} />
            <span>Transaction Risk</span>
          </NavLink>
          <NavLink to="/risk-alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={16} />
            <span>Risk Alerts & Verification</span>
          </NavLink>
          <NavLink to="/policies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={16} />
            <span>Policies</span>
          </NavLink>
          <NavLink to="/audit-log" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <List size={16} />
            <span>Audit Log</span>
          </NavLink>
          <NavLink to="/system-health" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Server size={16} />
            <span>System Health</span>
          </NavLink>
          <NavLink to="/api-docs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Key size={16} />
            <span>API Keys & Control</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
