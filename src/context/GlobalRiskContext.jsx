import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { fetchCurrentGlobalRisk, updateGlobalRiskScenario, SCENARIOS } from '../services/globalRiskService.js';
import { useAuth } from './AuthContext.jsx';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [controlState, setControlState] = useState(SCENARIOS.LOW);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const channelRef = useRef(null);

  // Apply fetched or realtime database row to global React state
  const applyControlState = useCallback((row) => {
    if (!row || !row.scenario) return;
    setControlState({
      scenario: row.scenario,
      risk_score: Number(row.risk_score) || 15,
      synthetic_probability: Number(row.synthetic_probability) || 15,
      authenticity: Number(row.authenticity) || 85,
      confidence: Number(row.confidence) || 92,
      risk_level: row.risk_level || 'LOW',
      recommended_action: row.recommended_action || 'CONTINUE',
      updated_by: row.updated_by || 'Presenter',
      updated_at: row.updated_at || new Date().toISOString()
    });
    console.log(`[SUPABASE REALTIME] Global State Synchronized: ${row.scenario} (${row.risk_score}/100)`);
  }, []);

  // Set up persistent Supabase Realtime channel subscription at application/root level
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
      console.log('[SUPABASE REALTIME] Supabase unconfigured, running local mode');
      setConnectionStatus('UNCONFIGURED');
      return;
    }

    // Single persistent subscription channel
    console.log('[SUPABASE REALTIME] Subscribing to postgres_changes for system2_global_risk (id=1)...');

    const channel = supabase
      .channel('system2-global-risk')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system2_global_risk',
          filter: 'id=eq.1'
        },
        (payload) => {
          console.log('[SUPABASE REALTIME] Realtime UPDATE event received:', payload);
          if (payload.new && payload.new.scenario && isMounted) {
            applyControlState(payload.new);
          }
        }
      )
      .subscribe((status, error) => {
        if (!isMounted) return;

        if (status === 'SUBSCRIBED') {
          console.log('[SUPABASE REALTIME]', 'status=SUBSCRIBED');
          setConnectionStatus('CONNECTED');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[SUPABASE REALTIME ERROR]', error || 'Channel error occurred');
          setConnectionStatus('ERROR');
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn(`[SUPABASE REALTIME] status=${status}`);
          setConnectionStatus('ERROR');
        }
      });

    channelRef.current = channel;

    // Initial database read (id = 1). Must NOT write to database during startup.
    fetchCurrentGlobalRisk().then((initialRow) => {
      if (isMounted && initialRow) {
        applyControlState(initialRow);
      }
    });

    return () => {
      isMounted = false;
      if (channelRef.current && supabase) {
        console.log('[SUPABASE REALTIME] Unsubscribing channel on root unmount');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [applyControlState]);

  // Presenter Scenario Update (Executed on Device A)
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    console.log(`[SUPABASE UPDATE] Triggering scenario update to: ${targetScenarioKey}`);

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);

      if (result.success && result.data) {
        // Immediately update local React state with returned database row
        applyControlState(result.data);
      } else if (result.error) {
        setUpdateError(result.error);
        console.error('[SUPABASE UPDATE ERROR] Returned error:', result.error);
      }
    } catch (err) {
      const errText = err.message || 'Failed to fetch';
      setUpdateError(errText);
      console.error('[SUPABASE UPDATE ERROR] Exception during update:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const contextValue = {
    scenario: controlState.scenario,
    riskScore: controlState.risk_score,
    syntheticProbability: controlState.synthetic_probability,
    authenticity: controlState.authenticity,
    confidence: controlState.confidence,
    riskLevel: controlState.risk_level,
    recommendedAction: controlState.recommended_action,
    updatedBy: controlState.updated_by,
    updatedAt: controlState.updated_at,
    realtimeStatus: connectionStatus,
    connectionStatus,
    isUpdating,
    updateError,
    updateScenario,
    isConfigured: isSupabaseConfigured
  };

  return (
    <GlobalRiskContext.Provider value={contextValue}>
      {children}
    </GlobalRiskContext.Provider>
  );
};
