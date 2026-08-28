import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { fetchAuditLogs } from '../services/globalRiskService';
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
  ChevronRight,
  Mic,
  MicOff,
  Volume2
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

  // 1. AUTOMATICALLY START AUDIO ANALYZER ON DASHBOARD MOUNT
  useEffect(() => {
    let isMounted = true;

    const initAudio = async () => {
      if (isMounted) {
        await start();
      }
    };

    initAudio();

    return () => {
      isMounted = false;
      stop();
    };
  }, []);

  // Fetch recent security audit logs
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
        padding: '1.25rem 1.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.6rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                NATIONAL VOICE SECURITY MONITORING
              </span>
              <span style={{ background: '#14532d', color: '#86efac', fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                SYSTEM 2 OPERATIONAL
              </span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '0.02em', color: '#ffffff' }}>
              NIRBHAYA SANCHAR — CYBER SECURITY OPERATIONS CENTER
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              Real-time automated audio monitoring and voice authenticity fraud detection.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#090e1a', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', minWidth: '120px' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>SYSTEM STATUS</span>
              <strong style={{ color: '#22c55e', fontSize: '0.84rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                <span className="status-dot online"></span> OPERATIONAL
              </strong>
            </div>

            <div style={{ background: '#090e1a', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', minWidth: '120px' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>GLOBAL SYNC</span>
              <strong style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#f59e0b', fontSize: '0.84rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                <Radio size={12} className="animate-pulse" /> {connectionStatus}
              </strong>
            </div>

            <div style={{ background: '#090e1a', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', minWidth: '120px' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>AI ENGINE</span>
              <strong style={{ color: '#38bdf8', fontSize: '0.84rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                <Cpu size={12} /> ACTIVE
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUAL FLOW CONNECTOR BANNER */}
      <div className="card" style={{ background: '#ffffff', borderColor: '#e2e8f0', padding: '0.85rem 1.2rem', marginBottom: 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          SECURITY PIPELINE FLOW
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '0.4rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: '700', color: '#0f172a', textAlign: 'center', flex: 1, minWidth: '100px' }}>
            1. LIVE AUDIO
          </div>
          <ChevronRight size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: '700', color: '#0284c7', textAlign: 'center', flex: 1, minWidth: '110px' }}>
            2. WAVEFORM
          </div>
          <ChevronRight size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: '700', color: '#4f46e5', textAlign: 'center', flex: 1, minWidth: '140px' }}>
            3. VOICE AUTHENTICITY
          </div>
          <ChevronRight size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ background: '#0f172a', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #0f172a', fontSize: '0.76rem', fontWeight: '800', color: '#ffffff', textAlign: 'center', flex: 1, minWidth: '120px' }}>
            4. GLOBAL RISK
          </div>
        </div>
      </div>

      {/* 3. HERO TOP SECTION: SIDE-BY-SIDE LIVE AUDIO MONITOR & GLOBAL RISK CARD (GRID-2) */}
      <div className="grid-2" style={{ alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: LIVE AUDIO MONITOR & WAVEFORM ANALYZER */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 className="card-title" style={{ fontSize: '1rem' }}>
                <Volume2 size={18} style={{ color: '#0284c7' }} />
                LIVE AUDIO MONITOR & WAVEFORM ANALYZER
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                <span className={`status-dot ${isAnalyzing ? 'online' : 'offline'}`}></span>
                <span style={{ color: isAnalyzing ? '#16a34a' : '#ef4444' }}>
                  {isAnalyzing ? 'AUDIO RECEIVING' : 'STANDBY'}
                </span>
                <span style={{ color: '#94a3b8' }}>• 16 kHz PCM</span>
              </div>
            </div>

            {audioError ? (
              <div className="alert-banner warning" style={{ marginBottom: '0.75rem', padding: '0.6rem 0.8rem', fontSize: '0.8rem' }}>
                <MicOff size={16} />
                <span>MICROPHONE PERMISSION REQUIRED: Please grant microphone access in browser toolbar.</span>
              </div>
            ) : null}

            {/* Continuous Live Canvas Waveform */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <canvas ref={canvasRef} className="waveform-canvas" style={{ height: '150px' }} />
              <div style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'rgba(15,23,42,0.85)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #334155' }}>
                LIVE SIGNAL MONITOR
              </div>
            </div>
          </div>

          {/* Audio Metrics Bar */}
          <div className="grid-4" style={{ gap: '0.5rem', background: 'var(--bg-card-alt)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div>
              <span className="telemetry-label" style={{ fontSize: '0.65rem' }}>MICROPHONE</span>
              <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: isAnalyzing ? '#16a34a' : '#ef4444', display: 'block' }}>
                {isAnalyzing ? 'ACTIVE' : 'INACTIVE'}
              </strong>
            </div>

            <div>
              <span className="telemetry-label" style={{ fontSize: '0.65rem' }}>SAMPLE RATE</span>
              <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#0f172a', display: 'block' }}>
                {telemetry.sampleRate ? `${(telemetry.sampleRate / 1000).toFixed(0)} kHz` : '16 kHz'}
              </strong>
            </div>

            <div>
              <span className="telemetry-label" style={{ fontSize: '0.65rem' }}>AUDIO QUALITY</span>
              <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#0284c7', display: 'block' }}>
                100% EXCELLENT
              </strong>
            </div>

            <div>
              <span className="telemetry-label" style={{ fontSize: '0.65rem' }}>WINDOWS</span>
              <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#4f46e5', display: 'block' }}>
                #{telemetry.windowCount?.toString().padStart(3, '0') || '001'}
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC GLOBAL RISK STATUS CARD */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 className="card-title" style={{ fontSize: '1rem' }}>
                <ShieldAlert size={18} style={{ color: scenario === 'HIGH' ? '#dc2626' : scenario === 'MEDIUM' ? '#d97706' : '#16a34a' }} />
                GLOBAL RISK STATUS
              </h3>
              <StatusBadge scenario={scenario} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1.2rem', 
                borderRadius: 'var(--radius-md)', 
                background: scenario === 'HIGH' ? '#fee2e2' : scenario === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
                border: `1px solid ${scenario === 'HIGH' ? '#fca5a5' : scenario === 'MEDIUM' ? '#fde047' : '#86efac'}`
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    DYNAMIC RISK SCORE
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: scenario === 'HIGH' ? '#991b1b' : scenario === 'MEDIUM' ? '#92400e' : '#166534', lineHeight: 1.1, marginTop: '0.15rem' }}>
                    {scenario === 'LOADING' ? '...' : `${riskScore} / 100`}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: scenario === 'HIGH' ? '#991b1b' : scenario === 'MEDIUM' ? '#92400e' : '#166534' }}>
                    RISK LEVEL: {riskLevel}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    RECOMMENDED ACTION
                  </span>
                  <div style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: '900', 
                    fontFamily: 'var(--font-mono)', 
                    color: '#ffffff',
                    background: scenario === 'HIGH' ? '#dc2626' : scenario === 'MEDIUM' ? '#d97706' : '#16a34a',
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '0.3rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}>
                    {recommendedAction}
                  </div>
                </div>
              </div>

              {/* Realtime Metrics Breakdown */}
              <div className="grid-3" style={{ gap: '0.5rem' }}>
                <div style={{ background: 'var(--bg-card-alt)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>SYNTHETIC PROB</span>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{syntheticProbability}%</strong>
                </div>

                <div style={{ background: 'var(--bg-card-alt)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>AUTHENTICITY</span>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{authenticity}%</strong>
                </div>

                <div style={{ background: 'var(--bg-card-alt)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>CONFIDENCE</span>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{confidence}%</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)', marginTop: '0.6rem' }}>
            ● Synchronized in real time from Supabase database row id=1 across all open devices.
          </div>
        </div>
      </div>

      {/* 4. AUDIO TELEMETRY GRID */}
      <AudioTelemetry telemetry={telemetry} />

      {/* 5. AI VOICE AUTHENTICITY ENGINE & SECURITY SIGNALS (GRID-2) */}
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

      {/* 6. SECURITY OPERATIONS MODULES & AUDIT LOG */}
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

      {/* 7. GOVERNMENT-STYLE FOOTER */}
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
