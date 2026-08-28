import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

export const AuthContext = createContext(null);

export const DEMO_PROFILES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Rahul Kumar',
    username: 'rahul',
    email: 'rahul@example.com',
    department: 'Security Operations Center',
    role: 'Lead Officer',
    status: 'ONLINE'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Muraari',
    username: 'muraari',
    email: 'muraari@example.com',
    department: 'Fraud Investigation Unit',
    role: 'Senior Analyst',
    status: 'ONLINE'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Priya Sharma',
    username: 'priya',
    email: 'priya@example.com',
    department: 'Cyber Threat Intelligence',
    role: 'Specialist',
    status: 'ONLINE'
  }
];

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(DEMO_PROFILES[0]); // Default to Rahul for demo
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check initial stored session in localStorage if offline demo
    const storedDemoUser = localStorage.getItem('system2_active_user');
    if (storedDemoUser) {
      try {
        const parsed = JSON.parse(storedDemoUser);
        if (parsed) setCurrentUser(parsed);
      } catch (e) {}
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      if (activeSession?.user) {
        fetchUserProfile(activeSession.user.id, activeSession.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id, currentSession.user.email);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (data) {
        setCurrentUser(data);
        localStorage.setItem('system2_active_user', JSON.stringify(data));
      } else {
        // Fallback or create profile
        const newProfile = {
          id: userId,
          auth_user_id: userId,
          full_name: userEmail?.split('@')[0] || 'System 2 User',
          username: userEmail?.split('@')[0] || 'user',
          email: userEmail,
          department: 'Security Operations',
          status: 'ONLINE'
        };
        setCurrentUser(newProfile);
        localStorage.setItem('system2_active_user', JSON.stringify(newProfile));
      }
    } catch (err) {
      console.warn('[AUTH] Error fetching profile:', err);
    }
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);

    // If Supabase is unconfigured, match against DEMO_PROFILES
    if (!isSupabaseConfigured || !supabase) {
      const matched = DEMO_PROFILES.find(
        (p) => p.email.toLowerCase() === email.toLowerCase() || p.username.toLowerCase() === email.toLowerCase()
      ) || {
        id: 'user-' + Date.now(),
        full_name: email.split('@')[0],
        username: email.split('@')[0],
        email: email,
        department: 'Security Operations',
        status: 'ONLINE'
      };

      setCurrentUser(matched);
      localStorage.setItem('system2_active_user', JSON.stringify(matched));
      return { success: true, user: matched };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      return { success: true };
    } catch (err) {
      setAuthError(err.message || 'Invalid credentials');
      return { success: false, error: err.message };
    }
  };

  const signUpWithEmail = async (email, password, fullName, username) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      const newProfile = {
        id: 'user-' + Date.now(),
        full_name: fullName || email.split('@')[0],
        username: username || email.split('@')[0],
        email: email,
        department: 'Security Operations',
        status: 'ONLINE'
      };
      setCurrentUser(newProfile);
      localStorage.setItem('system2_active_user', JSON.stringify(newProfile));
      return { success: true, user: newProfile };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, username }
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  // Demo user switcher (Rahul / Muraari / Priya) for instant cross-device testing
  const switchDemoProfile = (profileId) => {
    const target = DEMO_PROFILES.find((p) => p.id === profileId) || DEMO_PROFILES[0];
    setCurrentUser(target);
    localStorage.setItem('system2_active_user', JSON.stringify(target));
    console.log('[AUTH] Switched active profile to:', target.full_name);
  };

  const logout = async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    localStorage.removeItem('system2_active_user');
  };

  const value = {
    session,
    currentUser,
    loading,
    authError,
    loginWithEmail,
    signUpWithEmail,
    switchDemoProfile,
    logout,
    isAuthenticated: Boolean(currentUser || session)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
