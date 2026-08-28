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
  LogOut,
  Shield
} from 'lucide-react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const { scenario, riskScore, connectionStatus } = useGlobalRisk();
  const { currentUser, logout } = useAuth();

  const getScenarioBadgeStyle = () => {
    if (scenario === 'HIGH') return 'badge-high';
    if (scenario === 'MEDIUM') return 'badge-medium';
    if (scenario === 'LOADING') return 'badge-medium';
    return 'badge-low';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header" style={{ background: '#070d19', borderBottom: '2px solid #1e293b' }}>
      {/* Top Tricolor Accent Line */}
      <div style={{ height: '3px', background: 'linear-gradient(to right, #ff9933 0%, #ffffff 50%, #128807 100%)' }}></div>

      <div className="header-top" style={{ padding: '0.85rem 1.5rem' }}>
        <div className="header-brand">
          {/* Government Emblem / Logo Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Nirbhaya Sanchar Logo" className="brand-logo-img" style={{ height: '48px', objectFit: 'contain' }} />
            <div style={{ height: '36px', width: '1px', background: '#334155' }}></div>
          </div>

          <div className="brand-titles">
            <div className="brand-title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="brand-title" style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.04em', color: '#ffffff' }}>
                NIRBHAYA SANCHAR
              </span>
              <span className="system-badge" style={{ background: '#0284c7', border: '1px solid #0369a1', color: '#ffffff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                SYSTEM 2
              </span>
            </div>
            <span className="brand-subtitle" style={{ fontSize: '0.74rem', color: '#94a3b8', letterSpacing: '0.04em', fontWeight: '600' }}>
              SECURE VOICE COMMUNICATION & AUTHENTICITY ENGINE
            </span>
          </div>
        </div>

        <div className="header-status-bar" style={{ background: '#0f172a', borderColor: '#334155' }}>
          {/* Logged-in Operator Pill */}
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

          <div className="status-indicator">
            <Radio size={14} className="animate-pulse" style={{ color: '#22c55e' }} />
            <span>GLOBAL SYNC:</span>
            <span className="status-dot online"></span>
            <span style={{ color: '#22c55e' }}>CONNECTED</span>
          </div>

          <div style={{ height: '16px', width: '1px', background: '#334155' }}></div>

          <div className="status-indicator">
            <span>GLOBAL RISK:</span>
            <span className={getScenarioBadgeStyle()}>
              {scenario === 'LOADING' ? 'LOADING...' : `${scenario} (${riskScore}/100)`}
            </span>
          </div>
        </div>
      </div>

      <nav className="header-nav" style={{ background: '#090e1a', borderTop: '1px solid #1e293b' }}>
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
