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
  const reconnectTimerRef = useRef(null);

  // Apply fetched or realtime database row to state
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
    console.log(`[SUPABASE REALTIME] Global State Updated: ${row.scenario} (${row.risk_score}/100)`);
  }, []);

  // Set up persistent Supabase Realtime channel subscription with reconnect
  const setupRealtimeSubscription = useCallback(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[SUPABASE REALTIME] Supabase unconfigured, running local mode');
      setConnectionStatus('UNCONFIGURED');
      return;
    }

    // Clean up existing channel if any
    if (channelRef.current) {
      console.log('[SUPABASE REALTIME] Removing previous channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('[SUPABASE REALTIME] Creating channel subscription for system2_global_risk (id=1)...');

    const channel = supabase
      .channel('system2-global-risk')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system2_global_risk',
          filter: 'id=eq.1'
        },
        (payload) => {
          console.log('[SUPABASE REALTIME] Realtime change event received:', payload);
          if (payload.new && payload.new.scenario) {
            applyControlState(payload.new);
          }
        }
      )
      .subscribe((status, error) => {
        console.log('[SUPABASE REALTIME]', status, error || '');

        if (status === 'SUBSCRIBED') {
          console.log('[SUPABASE REALTIME] Channel successfully SUBSCRIBED');
          setConnectionStatus('CONNECTED');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[SUPABASE REALTIME ERROR]', error || 'Channel subscription failed');
          setConnectionStatus('ERROR');
          scheduleReconnect();
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn(`[SUPABASE REALTIME] Channel status: ${status}`);
          setConnectionStatus('ERROR');
          scheduleReconnect();
        }
      });

    channelRef.current = channel;
  }, [applyControlState]);

  // Reconnect logic on disconnect/error
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    console.log('[SUPABASE REALTIME] Scheduling reconnect in 3 seconds...');
    reconnectTimerRef.current = setTimeout(async () => {
      reconnectTimerRef.current = null;
      console.log('[SUPABASE REALTIME] Executing reconnect...');
      // Re-fetch database row on reconnect
      const freshRow = await fetchCurrentGlobalRisk();
      applyControlState(freshRow);
      setupRealtimeSubscription();
    }, 3000);
  }, [applyControlState, setupRealtimeSubscription]);

  // Initial Startup Execution
  useEffect(() => {
    let isMounted = true;

    const initGlobalState = async () => {
      // 1. SELECT * FROM public.system2_global_risk WHERE id = 1
      const initialRow = await fetchCurrentGlobalRisk();
      if (isMounted && initialRow) {
        applyControlState(initialRow);
      }

      // 2. Establish Realtime subscription
      if (isMounted) {
        setupRealtimeSubscription();
      }
    };

    initGlobalState();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (channelRef.current && supabase) {
        console.log('[SUPABASE REALTIME] Cleaning up channel on unmount');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [applyControlState, setupRealtimeSubscription]);

  // Presenter Update Method (Updates Supabase row id=1)
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    console.log(`[SUPABASE UPDATE] Triggering database update for scenario: ${targetScenarioKey}`);

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);
      if (result.success && result.data) {
        applyControlState(result.data);
      } else if (result.error) {
        setUpdateError(result.error);
      }
    } catch (err) {
      setUpdateError(err.message || 'Error updating scenario');
      console.error('[SUPABASE UPDATE ERROR]', err);
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
