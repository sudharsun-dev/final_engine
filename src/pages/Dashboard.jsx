import React from 'react';
import { useGlobalRisk } from '../hooks/useGlobalRisk';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { RiskCard } from '../components/RiskCard';
import { AudioWaveform } from '../components/AudioWaveform';
import { AudioTelemetry } from '../components/AudioTelemetry';
import { Pipeline } from '../components/Pipeline';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldCheck, Activity, Server, Radio, ShieldAlert } from 'lucide-react';

export const Dashboard = () => {
  const { scenario, riskScore, connectionStatus, recommendedAction, updatedAt } = useGlobalRisk();
  const { canvasRef, isAnalyzing, audioError, telemetry, start, stop } = useAudioAnalyzer();

  return (
    <div className="dashboard-page">
      {/* System Status Banner */}
      <div className="card" style={{ background: '#0b132b', color: '#ffffff', borderColor: '#1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span style={{ background: '#22c55e', color: '#ffffff', fontSize: '0.72rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                ENGINE ONLINE
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>SECURITY OPERATIONS CENTER DASHBOARD</h2>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
              Real-time voice authenticity verification, audio telemetry, and cross-device risk synchronization.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>SUPABASE REALTIME</span>
              <strong style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {connectionStatus}
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>GLOBAL RISK STATE</span>
              <StatusBadge scenario={scenario} />
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>ACTION</span>
              <strong style={{ 
                color: recommendedAction === 'HOLD' ? '#ef4444' : recommendedAction === 'VERIFY' ? '#f59e0b' : '#22c55e', 
                fontFamily: 'var(--font-mono)' 
              }}>
                {recommendedAction}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Risk Gauge & Decision */}
      <RiskCard />

      {/* Live Audio Monitor & Waveform */}
      <AudioWaveform 
        canvasRef={canvasRef}
        isAnalyzing={isAnalyzing}
        audioError={audioError}
        telemetry={telemetry}
        onStart={start}
        onStop={stop}
      />

      {/* Telemetry Grid */}
      <AudioTelemetry telemetry={telemetry} />

      {/* System Pipeline Diagram */}
      <Pipeline />
    </div>
  );
};
