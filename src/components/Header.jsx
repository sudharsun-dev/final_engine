import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  CreditCard, 
  AlertTriangle, 
  FileText, 
  List, 
  Server, 
  Key, 
  Radio,
  User,
  LogOut,
  PhoneCall
} from 'lucide-react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAuth } from '../context/AuthContext';
import { useGlobalCall } from '../context/GlobalCallContext';

export const Header = () => {
  const navigate = useNavigate();
  const { scenario, riskScore, connectionStatus, updateScenario } = useGlobalRisk();
  const { currentUser, logout } = useAuth();
  const { activeCall, isCallActive } = useGlobalCall();

  const getScenarioBadgeStyle = () => {
    if (scenario === 'HIGH') return 'badge-high';
    if (scenario === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
          {/* User Profile Pill */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700' }}>
                {currentUser.full_name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>
                {currentUser.full_name}
              </span>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.1rem 0.2rem', display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          )}

          {/* Active Call Badge */}
          {isCallActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#14532d', color: '#86efac', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #22c55e', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              <PhoneCall size={12} className="animate-pulse" />
              <span>ACTIVE CALL: {activeCall?.call_id}</span>
            </div>
          )}

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
