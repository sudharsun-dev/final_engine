import React from 'react';
import { useGlobalCall } from '../context/GlobalCallContext';
import { PhoneIncoming, PhoneOff, Check, ShieldAlert } from 'lucide-react';

export const IncomingCallModal = () => {
  const { incomingCall, acceptCall, endCall } = useGlobalCall();

  if (!incomingCall) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 11, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#0b132b',
        border: '2px solid #38bdf8',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #0d9488)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.2rem auto',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
        }}>
          <PhoneIncoming size={32} className="animate-bounce" style={{ color: '#ffffff' }} />
        </div>

        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', letterSpacing: '0.08em', fontWeight: '700', textTransform: 'uppercase' }}>
          INCOMING SYSTEM 2 SECURE CALL
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.4rem 0' }}>
          {incomingCall.caller_name || 'Incoming Caller'}
        </h2>

        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
          CALL ID: <strong style={{ color: '#ffffff' }}>{incomingCall.call_id}</strong>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#22c55e', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={14} /> VOICE AUTHENTICITY MONITOR READY
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={endCall}
            style={{
              flex: 1,
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#dc2626',
              color: '#ffffff',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }}
          >
            <PhoneOff size={18} /> DECLINE
          </button>

          <button
            onClick={acceptCall}
            style={{
              flex: 1,
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#16a34a',
              color: '#ffffff',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
            }}
          >
            <Check size={18} /> ACCEPT CALL
          </button>
        </div>
      </div>
    </div>
  );
};
