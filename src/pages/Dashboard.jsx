import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useGlobalCall } from '../context/GlobalCallContext';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { RiskCard } from '../components/RiskCard';
import { AudioWaveform } from '../components/AudioWaveform';
import { AudioTelemetry } from '../components/AudioTelemetry';
import { Pipeline } from '../components/Pipeline';
import { StatusBadge } from '../components/StatusBadge';
import { GlobalRiskControl } from '../components/GlobalRiskControl';
import { 
  Search, 
  User, 
  Phone, 
  PhoneOff, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Clock, 
  UserCheck, 
  CheckCircle,
  Building,
  UserPlus
} from 'lucide-react';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const { 
    activeCall, 
    isCallActive, 
    isCallRinging, 
    callDuration, 
    scenario, 
    recommendedAction, 
    startCall, 
    endCall,
    acceptCall
  } = useGlobalCall();

  const { canvasRef, isAnalyzing, audioError, telemetry, start, stop } = useAudioAnalyzer();

  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState(DEMO_PROFILES);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [startingCall, setStartingCall] = useState(false);

  // Fetch profiles from Supabase if configured
  useEffect(() => {
    const loadProfiles = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (data && data.length > 0) {
          setProfiles(data);
        }
      } catch (err) {
        console.warn('[DASHBOARD] Fetch profiles warning:', err);
      }
    };
    loadProfiles();
  }, []);

  // Filter profiles based on search query (exclude current logged in user)
  const filteredProfiles = profiles.filter((p) => {
    if (currentUser && (p.id === currentUser.id || p.email === currentUser.email)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q)
    );
  });

  const handleStartCall = async (person) => {
    setStartingCall(true);
    const res = await startCall(person);
    setStartingCall(false);

    // Also start local microphone audio analyzer
    if (!isAnalyzing) {
      start();
    }
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
              Logged in as: <strong style={{ color: '#38bdf8' }}>{currentUser?.full_name} ({currentUser?.department})</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>CALL STATUS</span>
              <strong style={{ color: isCallActive ? '#22c55e' : isCallRinging ? '#f59e0b' : '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {isCallActive ? 'CALL CONNECTED' : isCallRinging ? 'RINGING...' : 'STANDBY'}
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>GLOBAL SCENARIO</span>
              <StatusBadge scenario={scenario} />
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>RECOMMENDED ACTION</span>
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

      {/* ACTIVE CALL SESSION PANEL */}
      {(isCallActive || isCallRinging) && activeCall && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#ffffff', borderColor: '#38bdf8' }}>
          <div className="card-header" style={{ borderBottomColor: '#334155' }}>
            <h3 className="card-title" style={{ color: '#ffffff' }}>
              <Phone size={20} className="animate-pulse" style={{ color: '#38bdf8' }} />
              ACTIVE SYSTEM 2 CALL SESSION
            </h3>
            <button onClick={endCall} className="btn btn-danger" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
              <PhoneOff size={14} /> END CALL
            </button>
          </div>

          <div className="grid-4" style={{ marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <span className="telemetry-label" style={{ color: '#94a3b8' }}>CALL ID</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#38bdf8' }}>{activeCall.call_id}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <span className="telemetry-label" style={{ color: '#94a3b8' }}>CALLER</span>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{activeCall.caller_name || 'Caller'}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <span className="telemetry-label" style={{ color: '#94a3b8' }}>RECEIVER</span>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{activeCall.receiver_name || 'Receiver'}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <span className="telemetry-label" style={{ color: '#94a3b8' }}>CALL DURATION</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#22c55e' }}>{formatDuration(callDuration)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* USER SEARCH & PERSON PROFILE SECTION */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Search Users Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Search size={18} style={{ color: 'var(--accent-teal)' }} />
              SEARCH SYSTEM 2 USER
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filteredProfiles.length} DIRECTORY USERS
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, username or email (e.g. Rahul, Muraari)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem 0.7rem 2.4rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card-alt)',
                outline: 'none',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredProfiles.map((person) => (
              <div
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: selectedPerson?.id === person.id ? 'var(--accent-teal)' : 'var(--border-color)',
                  background: selectedPerson?.id === person.id ? '#f0fdf4' : 'var(--bg-card-alt)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-header)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                    {person.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{person.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{person.email} • {person.department}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="status-dot online"></span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--risk-low)' }}>
                    ONLINE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Person Profile Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <UserCheck size={18} style={{ color: 'var(--accent-blue)' }} />
              PERSON PROFILE & CALL INITIATOR
            </h3>
          </div>

          {selectedPerson ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.4rem' }}>
                  {selectedPerson.full_name?.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedPerson.full_name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{selectedPerson.username} • {selectedPerson.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginTop: '0.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building size={12} /> {selectedPerson.department} ({selectedPerson.role})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card-alt)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>PRESENCE STATUS:</span>
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--risk-low)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> ONLINE & READY FOR CALL
                </span>
              </div>

              <button
                onClick={() => handleStartCall(selectedPerson)}
                disabled={startingCall || isCallActive || isCallRinging}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  fontWeight: '800',
                  borderRadius: 'var(--radius-md)',
                  background: '#16a34a',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                }}
              >
                <Phone size={18} /> {startingCall ? 'STARTING CALL...' : `START CALL WITH ${selectedPerson.full_name.toUpperCase()}`}
              </button>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <User size={40} style={{ opacity: 0.3, marginBottom: '0.6rem' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Select a person from the search list to view profile and initiate a System 2 call.</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Risk Control */}
      <GlobalRiskControl />

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
