import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { fetchCurrentGlobalRisk, updateGlobalRiskScenario, SCENARIOS } from '../services/globalRiskService.js';
import { useAuth } from './AuthContext.jsx';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [controlState, setControlState] = useState(SCENARIOS.LOW);
  const [realtimeStatus, setRealtimeStatus] = useState(isSupabaseConfigured ? 'CONNECTING' : 'UNCONFIGURED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Apply state update safely
  const applyControlState = useCallback((row) => {
    if (!row) return;
    setControlState((prev) => {
      const next = {
        scenario: row.scenario || 'LOW',
        risk_score: Number(row.risk_score) || 15,
        synthetic_probability: Number(row.synthetic_probability) || 15,
        authenticity: Number(row.authenticity) || 85,
        confidence: Number(row.confidence) || 92,
        risk_level: row.risk_level || 'LOW',
        recommended_action: row.recommended_action || 'CONTINUE',
        updated_by: row.updated_by || 'Presenter',
        updated_at: row.updated_at || new Date().toISOString()
      };
      console.log(`[GLOBAL-RISK] Scenario changed: ${next.scenario} (${next.risk_score}/100)`);
      console.log('[GLOBAL-RISK] UI synchronized');
      return next;
    });
  }, []);

  // Supabase Realtime Subscription + Local Channel Listener
  useEffect(() => {
    let channel = null;

    // Local BroadcastChannel listener for multi-window local sync
    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('system2_global_risk_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SCENARIO_UPDATE' && event.data.data) {
          console.log('[GLOBAL-RISK] BroadcastChannel event received:', event.data.data);
          applyControlState(event.data.data);
        }
      };
    }

    // Storage event listener fallback
    const handleStorageChange = (e) => {
      if (e.key === 'system2_global_risk_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.data) {
            console.log('[GLOBAL-RISK] Storage sync event received:', parsed.data);
            applyControlState(parsed.data);
          }
        } catch (err) {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    const initGlobalRisk = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setRealtimeStatus('UNCONFIGURED');
          console.log('[GLOBAL-RISK] Running in offline demo mode (Supabase unconfigured)');
          const initial = await fetchCurrentGlobalRisk();
          applyControlState(initial);
          return;
        }

        console.log('[GLOBAL-RISK] Realtime connected');
        setRealtimeStatus('CONNECTED');

        // Initial state load from system2_global_risk row id=1
        const initialRow = await fetchCurrentGlobalRisk();
        applyControlState(initialRow);
        console.log('[GLOBAL-RISK] Initial state loaded');

        // Subscribe to Supabase Realtime postgres_changes on system2_global_risk
        channel = supabase
          .channel('system2_global_risk_realtime')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'system2_global_risk',
              filter: 'id=eq.1'
            },
            (payload) => {
              console.log('[GLOBAL-RISK] Realtime update received from Supabase:', payload.new);
              applyControlState(payload.new);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[GLOBAL-RISK] Supabase Realtime channel subscribed and active');
              setRealtimeStatus('CONNECTED');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.warn(`[GLOBAL-RISK ERROR] Realtime channel status: ${status}`);
              setRealtimeStatus('ERROR');
            }
          });
      } catch (err) {
        console.error('[GLOBAL-RISK ERROR] Setup failed:', err.message || err);
        setRealtimeStatus('ERROR');
      }
    };

    initGlobalRisk();

    return () => {
      if (bc) bc.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
      if (channel && supabase) {
        console.log('[GLOBAL-RISK] Unsubscribing from Realtime channel...');
        supabase.removeChannel(channel);
      }
    };
  }, [applyControlState]);

  // Method for presenter control to switch global scenario
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const previousState = { ...controlState };
    const updatedBy = currentUser?.full_name || 'Presenter';

    console.log(`[GLOBAL-RISK] Presenter triggering scenario change: ${previousState.scenario} -> ${targetScenarioKey}`);

    // 1. Instant 0ms Optimistic UI Update
    applyControlState({
      ...SCENARIOS[targetScenarioKey],
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    });

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy, previousState);
      if (result.success && result.data) {
        applyControlState(result.data);
        console.log('[GLOBAL-RISK] Database update successful');
      } else if (result.error) {
        setUpdateError(result.error);
        console.error('[GLOBAL-RISK ERROR] Database update warning:', result.error);
      }
    } catch (err) {
      setUpdateError(err.message || 'Error updating scenario');
      console.error('[GLOBAL-RISK ERROR] Failed scenario update:', err);
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
    realtimeStatus,
    connectionStatus: realtimeStatus,
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
