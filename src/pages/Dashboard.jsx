import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { fetchAuditLogs } from '../services/globalRiskService';
import { AudioWaveform } from '../components/AudioWaveform';
import { AudioTelemetry } from '../components/AudioTelemetry';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Radio, 
  ShieldAlert, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  ArrowRight,
  Clock,
  List,
  FileText,
  CreditCard,
  Building2,
  ChevronRight
} from 'lucide-react';

export const Dashboard = () => {
  const { 
    scenario, 
    riskScore, 
    syntheticProbability, 
    authenticity, 
    confidence, 
    riskLevel, 
    recommendedAction, 
    connectionStatus 
  } = useGlobalRisk();

  const { canvasRef, isAnalyzing, audioError, telemetry, start, stop } = useAudioAnalyzer();

  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await fetchAuditLogs(5);
      setAuditLogs(logs);
    };
    loadLogs();
  }, [scenario]);

  const getSeverityStyle = (level) => {
    if (level === 'HIGH' || level === 'CRITICAL') return { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' };
    if (level === 'MEDIUM') return { color: '#d97706', bg: '#fef3c7', border: '#fde047' };
    return { color: '#16a34a', bg: '#dcfce7', border: '#86efac' };
  };

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. NATIONAL SECURITY HERO BANNER */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #070d19 0%, #0f172a 60%, #1e293b 100%)', 
        color: '#ffffff', 
        borderColor: '#334155',
        borderLeft: '5px solid #0284c7',
        padding: '1.4rem 1.6rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.6rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                NATIONAL VOICE SECURITY MONITORING
              </span>
              <span style={{ background: '#14532d', color: '#86efac', fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                CLASSIFIED PROTOTYPE
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '0.02em', color: '#ffffff' }}>
              NIRBHAYA SANCHAR — CYBER SECURITY OPERATIONS CENTER
            </h1>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Real-time monitoring and risk assessment for voice impersonation, synthetic speech and communication fraud.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#090e1a', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', minWidth: '130px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>SYSTEM STATUS</span>
              <strong style={{ color: '#22c55e', fontSize: '0.88rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                <span className="status-dot online"></span> OPERATIONAL
              </strong>
            </div>

            <div style={{ background: '#090e1a', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', minWidth: '130px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>GLOBAL SYNC</span>
              <strong style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#f59e0b', fontSize: '0.88rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                <Radio size={12} className="animate-pulse" /> {connectionStatus}
              </strong>
            </div>

            <div style={{ background: '#090e1a', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', minWidth: '130px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>AI ENGINE</span>
              <strong style={{ color: '#38bdf8', fontSize: '0.88rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                <Cpu size={12} /> ACTIVE
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIH 2026 JUDGE ARCHITECTURE FLOW BANNER (SECTION 17) */}
      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          SIH 2026 ARCHITECTURE — END-TO-END SECURITY PIPELINE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.2rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', textAlign: 'center', flex: 1, minWidth: '110px' }}>
            1. VOICE CALL
          </div>
          <ChevronRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '700', color: '#0284c7', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            2. LIVE AUDIO ANALYSIS
          </div>
          <ChevronRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '700', color: '#4f46e5', textAlign: 'center', flex: 1, minWidth: '150px' }}>
            3. AI AUTHENTICITY DETECTION
          </div>
          <ChevronRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '700', color: '#0d9488', textAlign: 'center', flex: 1, minWidth: '160px' }}>
            4. MULTI-SIGNAL RISK ASSESSMENT
          </div>
          <ChevronRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '700', color: '#d97706', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            5. GLOBAL RISK SCORE
          </div>
          <ChevronRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#0f172a', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #0f172a', fontSize: '0.78rem', fontWeight: '800', color: '#ffffff', textAlign: 'center', flex: 1, minWidth: '120px' }}>
            6. SECURITY ACTION
          </div>
        </div>
      </div>

      {/* 3. LIVE SECURITY OVERVIEW & GLOBAL RISK CARD (GRID-2) */}
      <div className="grid-2">
        
        {/* Live Security Overview Panel */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={18} style={{ color: '#0284c7' }} />
              LIVE SECURITY OVERVIEW
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              REAL-TIME SOC METRICS
            </span>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span className="telemetry-label">ACTIVE SESSIONS</span>
              <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#0f172a', marginTop: '0.2rem' }}>
                01
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1 Active Monitoring Stream</span>
            </div>

            <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span className="telemetry-label">VOICE ANALYSIS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isAnalyzing ? '#16a34a' : '#0284c7', marginTop: '0.5rem' }}>
                {isAnalyzing ? 'ACTIVE (LIVE)' : 'STANDBY (READY)'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Microphone DSP Active</span>
            </div>

            <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span className="telemetry-label">GLOBAL RISK</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: scenario === 'HIGH' ? '#dc2626' : scenario === 'MEDIUM' ? '#d97706' : '#16a34a', marginTop: '0.3rem' }}>
                {scenario === 'LOADING' ? 'LOADING...' : `${scenario} · ${riskScore}/100`}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Action: <strong>{recommendedAction}</strong></span>
            </div>

            <div style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span className="telemetry-label">SECURITY ALERTS</span>
              <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: scenario === 'HIGH' ? '#dc2626' : '#0f172a', marginTop: '0.2rem' }}>
                {scenario === 'HIGH' ? '02' : scenario === 'MEDIUM' ? '01' : '00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Triggered Signals</span>
            </div>
          </div>
        </div>

        {/* Global Risk Status Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={18} style={{ color: scenario === 'HIGH' ? '#dc2626' : scenario === 'MEDIUM' ? '#d97706' : '#16a34a' }} />
              GLOBAL RISK STATUS
            </h3>
            <StatusBadge scenario={scenario} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1.1rem', 
              borderRadius: 'var(--radius-md)', 
              background: scenario === 'HIGH' ? '#fee2e2' : scenario === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
              border: `1px solid ${scenario === 'HIGH' ? '#fca5a5' : scenario === 'MEDIUM' ? '#fde047' : '#86efac'}`
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  RISK SCORE & LEVEL
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: scenario === 'HIGH' ? '#991b1b' : scenario === 'MEDIUM' ? '#92400e' : '#166534', lineHeight: 1.1, marginTop: '0.2rem' }}>
                  {scenario === 'LOADING' ? '...' : `${riskScore} / 100`}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: scenario === 'HIGH' ? '#991b1b' : scenario === 'MEDIUM' ? '#92400e' : '#166534' }}>
                  RISK LEVEL: {riskLevel}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  RECOMMENDED ACTION
                </span>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '900', 
                  fontFamily: 'var(--font-mono)', 
                  color: '#ffffff',
                  background: scenario === 'HIGH' ? '#dc2626' : scenario === 'MEDIUM' ? '#d97706' : '#16a34a',
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '0.3rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  {recommendedAction}
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid-3" style={{ gap: '0.6rem' }}>
              <div style={{ background: 'var(--bg-card-alt)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>SYNTHETIC PROB</span>
                <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{syntheticProbability}%</strong>
              </div>

              <div style={{ background: 'var(--bg-card-alt)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>AUTHENTICITY</span>
                <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{authenticity}%</strong>
              </div>

              <div style={{ background: 'var(--bg-card-alt)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>CONFIDENCE</span>
                <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{confidence}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE AUDIO ANALYZER FRAME */}
      <AudioWaveform 
        canvasRef={canvasRef}
        isAnalyzing={isAnalyzing}
        audioError={audioError}
        telemetry={telemetry}
        onStart={start}
        onStop={stop}
      />

      {/* 5. AUDIO TELEMETRY GRID */}
      <AudioTelemetry telemetry={telemetry} />

      {/* 6. AI VOICE AUTHENTICITY ENGINE & SECURITY SIGNALS (GRID-2) */}
      <div className="grid-2">
        {/* AI Voice Authenticity Engine Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Cpu size={18} style={{ color: 'var(--accent-indigo)' }} />
              AI VOICE AUTHENTICITY ENGINE
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>SYNTHETIC SPEECH PROBABILITY</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: scenario === 'HIGH' ? '#dc2626' : '#16a34a' }}>
                {syntheticProbability}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>VOICE AUTHENTICITY SCORE</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: authenticity < 50 ? '#dc2626' : '#16a34a' }}>
                {authenticity}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>DEEPFAKE MODEL CONFIDENCE</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#0284c7' }}>
                {confidence}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: scenario === 'HIGH' ? '#fee2e2' : '#f0fdf4', borderRadius: 'var(--radius-sm)', border: `1px solid ${scenario === 'HIGH' ? '#fca5a5' : '#bbf7d0'}` }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)' }}>CLASSIFICATION VERDICT</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '800', color: scenario === 'HIGH' ? '#dc2626' : '#16a34a' }}>
                {scenario === 'HIGH' ? 'SYNTHETIC / HIGH RISK' : scenario === 'MEDIUM' ? 'SUSPICIOUS / VERIFY' : 'GENUINE VOICE'}
              </strong>
            </div>
          </div>
        </div>

        {/* Security Signals List Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              ACTIVE SECURITY SIGNALS
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-dot" style={{ background: scenario === 'HIGH' ? '#dc2626' : '#16a34a' }}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Voice Authenticity Anomaly</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', ...getSeverityStyle(scenario) }}>
                {scenario}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-dot" style={{ background: scenario === 'HIGH' ? '#dc2626' : '#16a34a' }}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Synthetic Speech Spectral Fingerprint</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', ...getSeverityStyle(scenario) }}>
                {scenario}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-dot" style={{ background: '#16a34a' }}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Behavioral Biomarkers</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}>
                LOW
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-dot" style={{ background: '#16a34a' }}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Contextual Device & Channel Signal</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}>
                LOW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. SECURITY OPERATIONS NAVIGATION PANEL */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Sliders size={18} style={{ color: '#0284c7' }} />
            SECURITY OPERATIONS MODULES
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QUICK SYSTEM NAVIGATION</span>
        </div>

        <div className="grid-4">
          <NavLink to="/live-analysis" style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Activity size={20} style={{ color: '#0284c7' }} />
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>VOICE AUTHENTICITY</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live spectral DSP VAD analysis</span>
          </NavLink>

          <NavLink to="/transaction-risk" style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <CreditCard size={20} style={{ color: '#4f46e5' }} />
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>RISK ASSESSMENT</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-signal adaptive risk engine</span>
          </NavLink>

          <NavLink to="/risk-alerts" style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <AlertTriangle size={20} style={{ color: '#d97706' }} />
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>ALERT MANAGEMENT</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security verification triggers</span>
          </NavLink>

          <NavLink to="/audit-log" style={{ background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <List size={20} style={{ color: '#0d9488' }} />
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>AUDIT TRAIL</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supabase immutable event log</span>
          </NavLink>
        </div>
      </div>

      {/* 8. RECENT AUDIT LOG TIMELINE */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={18} style={{ color: '#0d9488' }} />
            RECENT SECURITY AUDIT EVENTS
          </h3>
          <NavLink to="/audit-log" style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '700' }}>
            VIEW ALL AUDIT LOGS →
          </NavLink>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                    Scenario transition to <strong style={{ color: '#0284c7' }}>{log.new_scenario}</strong> ({log.new_score}/100)
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', background: '#1e293b', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {log.updated_by}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No audit logs recorded yet. Changes made in API Keys & Control will record events here.
            </div>
          )}
        </div>
      </div>

      {/* 9. GOVERNMENT-STYLE RESTRAINED FOOTER */}
      <footer style={{ 
        marginTop: '1.5rem', 
        paddingTop: '1.2rem', 
        borderTop: '2px solid #334155', 
        fontSize: '0.78rem', 
        color: '#64748b',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <strong style={{ color: '#0f172a' }}>NIRBHAYA SANCHAR — SYSTEM 2</strong> • Secure Voice Communication & Authenticity Engine
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
            Classified Security Prototype developed for Smart India Hackathon 2026.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
          <span>SYSTEM STATUS: <strong style={{ color: '#16a34a' }}>OPERATIONAL</strong></span>
          <span>SECURITY: <strong style={{ color: '#0284c7' }}>RLS ENABLED</strong></span>
          <span>AUDIT: <strong style={{ color: '#0d9488' }}>ACTIVE</strong></span>
        </div>
      </footer>

    </div>
  );
};
