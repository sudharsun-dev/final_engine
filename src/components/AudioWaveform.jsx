import React from 'react';
import { Mic, MicOff, Activity, AlertCircle } from 'lucide-react';

export const AudioWaveform = ({ 
  canvasRef, 
  isAnalyzing, 
  audioError, 
  telemetry, 
  onStart, 
  onStop 
}) => {
  return (
    <div className="card" style={{ background: '#0b132b', color: '#ffffff', borderColor: '#1e293b' }}>
      <div className="card-header" style={{ borderBottomColor: '#1e293b' }}>
        <h3 className="card-title" style={{ color: '#ffffff' }}>
          <Activity size={18} style={{ color: isAnalyzing ? '#22c55e' : '#94a3b8' }} />
          LIVE AUDIO MONITOR & WAVEFORM ANALYZER
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isAnalyzing ? (
            <button onClick={onStart} className="btn btn-primary">
              <Mic size={16} /> START AUDIO ANALYSIS
            </button>
          ) : (
            <button onClick={onStop} className="btn btn-danger">
              <MicOff size={16} /> STOP AUDIO ANALYSIS
            </button>
          )}
        </div>
      </div>

      {audioError && (
        <div className="alert-banner error" style={{ background: '#450a0a', borderColor: '#991b1b', color: '#fca5a5' }}>
          <AlertCircle size={16} />
          <span>{audioError}</span>
        </div>
      )}

      {/* Canvas Waveform Display */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
        <canvas ref={canvasRef} width={800} height={140} className="waveform-canvas" />

        {/* Overlay Telemetry Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          background: 'rgba(7, 11, 20, 0.85)',
          padding: '0.3rem 0.7rem',
          borderRadius: '4px',
          border: '1px solid #1e293b',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: isAnalyzing ? '#22c55e' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span className={`status-dot ${isAnalyzing ? 'online' : 'offline'}`}></span>
          <span>{isAnalyzing ? 'LIVE MICROPHONE FEED' : 'STANDBY (PRESS START)'}</span>
        </div>

        {/* Audio Level Visualizer Meter */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(7, 11, 20, 0.8)',
          padding: '0.25rem 0.6rem',
          borderRadius: '4px',
          border: '1px solid #1e293b'
        }}>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>LEVEL:</span>
          <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${telemetry.audioLevel || 0}%`,
              background: telemetry.audioLevel > 50 ? '#38bdf8' : '#0d9488',
              transition: 'width 0.1s linear'
            }} />
          </div>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#ffffff', minWidth: '35px' }}>
            {telemetry.audioLevel}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
        <span>MICROPHONE: <strong style={{ color: isAnalyzing ? '#22c55e' : '#ef4444' }}>{isAnalyzing ? 'ACTIVE' : 'INACTIVE'}</strong></span>
        <span>SAMPLE RATE: <strong style={{ color: '#ffffff' }}>{telemetry.sampleRate} Hz</strong></span>
        <span>CHANNELS: <strong style={{ color: '#ffffff' }}>1 MONO</strong></span>
        <span>WINDOW: <strong style={{ color: '#38bdf8' }}>#{telemetry.windowCount} (2.5s)</strong></span>
      </div>
    </div>
  );
};
