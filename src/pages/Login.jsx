import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, UserCheck, ArrowRight, KeyRound } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { loginWithEmail, signUpWithEmail, switchDemoProfile, authError } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    let res;
    if (isRegister) {
      res = await signUpWithEmail(email, password, fullName, username);
    } else {
      res = await loginWithEmail(email, password);
    }

    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleQuickDemoLogin = (profileId) => {
    switchDemoProfile(profileId);
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #070b14 0%, #0b132b 50%, #1c2541 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      color: '#ffffff'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #1e293b',
        borderRadius: 'var(--radius-lg)',
        padding: '2.2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Nirbhaya Sanchar Logo" style={{ height: '70px', marginBottom: '1rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '0.04em', color: '#ffffff' }}>
            NIRBHAYA SANCHAR
          </h1>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: '#2563eb', color: '#fff', padding: '0.15rem 0.6rem', borderRadius: '4px', display: 'inline-block', margin: '0.4rem 0' }}>
            SYSTEM 2 OPERATOR AUTHENTICATION
          </span>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            SECURE VOICE COMMUNICATION & AUTHENTICITY ENGINE
          </p>
        </div>

        {authError && (
          <div className="alert-banner error" style={{ marginBottom: '1.25rem', background: '#450a0a', borderColor: '#991b1b', color: '#fca5a5' }}>
            <Lock size={16} />
            <span>{authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: '600' }}>FULL NAME</label>
                <input
                  type="text"
                  placeholder="Rahul Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', background: '#090d16', border: '1px solid #334155', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: '600' }}>USERNAME</label>
                <input
                  type="text"
                  placeholder="rahul"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', background: '#090d16', border: '1px solid #334155', color: '#fff', outline: 'none' }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: '600' }}>EMAIL / USERNAME</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.5rem', borderRadius: 'var(--radius-sm)', background: '#090d16', border: '1px solid #334155', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: '600' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.5rem', borderRadius: 'var(--radius-sm)', background: '#090d16', border: '1px solid #334155', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: 'var(--radius-md)',
              background: '#0d9488',
              color: '#ffffff',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }}
          >
            {isRegister ? 'CREATE ACCOUNT' : 'LOGIN TO SYSTEM 2'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '1.2rem', color: '#94a3b8' }}>
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: 'inherit' }}>
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
          <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact SOC Administrator to reset password.'); }} style={{ color: '#94a3b8' }}>
            Forgot Password?
          </a>
        </div>

        {/* Demo Switcher Options for Quick Device A / Device B Testing */}
        <div style={{ marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid #1e293b' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.6rem', textAlign: 'center' }}>
            QUICK DEMO PROFILES (FOR TWO-DEVICE / TWO-WINDOW TEST)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleQuickDemoLogin(DEMO_PROFILES[0].id)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              👤 DEVICE A: Rahul
            </button>

            <button
              onClick={() => handleQuickDemoLogin(DEMO_PROFILES[1].id)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              👤 DEVICE B: Muraari
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
