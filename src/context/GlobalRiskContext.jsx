import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { fetchCurrentControl, setGlobalRiskScenario, SCENARIOS } from '../services/globalRiskService';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const [controlState, setControlState] = useState(SCENARIOS.LOW);
  const [connectionStatus, setConnectionStatus] = useState(isSupabaseConfigured ? 'CONNECTING' : 'UNCONFIGURED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Apply fetched or realtime database row to state
  const applyControlState = useCallback((row) => {
    if (!row) return;
    setControlState({
      scenario: row.scenario || 'LOW',
      risk_score: Number(row.risk_score) || 15,
      synthetic_probability: Number(row.synthetic_probability) || 15,
      authenticity: Number(row.authenticity) || 85,
      confidence: Number(row.confidence) || 92,
      risk_level: row.risk_level || 'LOW',
      recommended_action: row.recommended_action || 'CONTINUE',
      updated_at: row.updated_at || new Date().toISOString()
    });
    console.log(`[GLOBAL-CONTROL] Scenario = ${row.scenario}`);
    console.log(`[GLOBAL-CONTROL] Risk Score = ${row.risk_score}`);
    console.log('[GLOBAL-CONTROL] UI state updated');
  }, []);

  // Initial Load and Realtime Subscription
  useEffect(() => {
    let channel = null;

    // 1. BroadcastChannel Listener for multi-window tab synchronization
    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('system2_control_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SCENARIO_UPDATE' && event.data.data) {
          console.log('[GLOBAL-CONTROL] BroadcastChannel update received:', event.data.data);
          applyControlState(event.data.data);
        }
      };
    }

    // 2. Storage Event Listener fallback for cross-window sync
    const handleStorageChange = (e) => {
      if (e.key === 'system2_control_local_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.data) {
            console.log('[GLOBAL-CONTROL] Local storage sync event received:', parsed.data);
            applyControlState(parsed.data);
          }
        } catch (err) {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    const initControl = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setConnectionStatus('UNCONFIGURED');
          console.log('[GLOBAL-CONTROL] Running in offline demo mode (Supabase unconfigured). Local window broadcast active.');
          return;
        }

        console.log('[SUPABASE] Connected');
        setConnectionStatus('CONNECTED');

        // Fetch initial database state
        const initialRow = await fetchCurrentControl();
        applyControlState(initialRow);
        console.log('[GLOBAL-CONTROL] Initial state loaded');

        // Subscribe to Realtime UPDATE changes on system2_control table
        channel = supabase
          .channel('system2_control_realtime')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'system2_control',
              filter: 'id=eq.1'
            },
            (payload) => {
              console.log('[GLOBAL-CONTROL] Database update received via Supabase Realtime:', payload.new);
              applyControlState(payload.new);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[GLOBAL-CONTROL] Realtime subscription active');
              setConnectionStatus('CONNECTED');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.warn(`[GLOBAL-CONTROL ERROR] Realtime channel status: ${status}`);
              setConnectionStatus('ERROR');
            }
          });
      } catch (err) {
        console.error('[GLOBAL-CONTROL ERROR] Setup failed:', err.message || err);
        setConnectionStatus('ERROR');
      }
    };

    initControl();

    return () => {
      if (bc) bc.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
      if (channel && supabase) {
        console.log('[GLOBAL-CONTROL] Unsubscribing from Realtime...');
        supabase.removeChannel(channel);
      }
    };
  }, [applyControlState]);

  // Method for UI components to change scenario
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const prevScenario = controlState.scenario;
    console.log(`[GLOBAL-CONTROL] Triggering scenario update: ${prevScenario} -> ${targetScenarioKey}`);

    // 1. Optimistic local update for 0ms instant UI response
    applyControlState({
      ...SCENARIOS[targetScenarioKey],
      updated_at: new Date().toISOString()
    });

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await setGlobalRiskScenario(targetScenarioKey, prevScenario);
      if (result.success && result.data) {
        applyControlState(result.data);
      } else if (result.error) {
        setUpdateError(result.error);
        console.error('[GLOBAL-CONTROL ERROR] Update warning:', result.error);
      }
    } catch (err) {
      setUpdateError(err.message || 'Error updating scenario');
      console.error('[GLOBAL-CONTROL ERROR] Failed scenario update:', err);
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
    updatedAt: controlState.updated_at,
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
