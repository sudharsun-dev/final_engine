import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { isSupabaseConfigured } from '../services/supabase.js';
import { fetchCurrentGlobalRisk, updateGlobalRiskScenario, SCENARIOS } from '../services/globalRiskService.js';
import { useAuth } from './AuthContext.jsx';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [controlState, setControlState] = useState(SCENARIOS.LOW);
  const [connectionStatus, setConnectionStatus] = useState('POLLING');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const isMountedRef = useRef(true);

  // Apply state update safely
  const applyControlState = useCallback((row) => {
    if (!row || !row.scenario) return;

    setControlState((prev) => {
      if (
        prev.scenario === row.scenario &&
        Number(prev.risk_score) === Number(row.risk_score) &&
        Number(prev.synthetic_probability) === Number(row.synthetic_probability) &&
        Number(prev.authenticity) === Number(row.authenticity) &&
        Number(prev.confidence) === Number(row.confidence)
      ) {
        return prev;
      }

      console.log(`[SYSTEM 2 STATE] Global Risk Synchronized: ${row.scenario} (${row.risk_score}/100)`);
      return {
        scenario: row.scenario,
        risk_score: Number(row.risk_score) || 15,
        synthetic_probability: Number(row.synthetic_probability) || 15,
        authenticity: Number(row.authenticity) || 85,
        confidence: Number(row.confidence) || 93,
        risk_level: row.risk_level || 'LOW',
        recommended_action: row.recommended_action || 'CONTINUE',
        updated_by: row.updated_by || 'Presenter',
        updated_at: row.updated_at || new Date().toISOString()
      };
    });
  }, []);

  // 1000ms Polling Loop & BroadcastChannel / Storage Listener
  useEffect(() => {
    isMountedRef.current = true;

    // BroadcastChannel listener for 0ms multi-tab/multi-window local sync
    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('system2_global_risk_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SCENARIO_UPDATE' && event.data.data) {
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
            applyControlState(parsed.data);
          }
        } catch (err) {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    const pollDatabase = async () => {
      const row = await fetchCurrentGlobalRisk();
      if (isMountedRef.current) {
        if (row) {
          setConnectionStatus('CONNECTED');
          applyControlState(row);
        } else {
          setConnectionStatus(isSupabaseConfigured ? 'CONNECTED' : 'LOCAL');
        }
      }
    };

    // Initial fetch on mount
    pollDatabase();

    // 1000ms polling interval
    const intervalId = setInterval(pollDatabase, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
      if (bc) bc.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [applyControlState]);

  // Presenter Update Function
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    setIsUpdating(true);
    setUpdateError(null);

    // 0ms Optimistic UI update
    applyControlState({
      ...SCENARIOS[targetScenarioKey],
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    });

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);
      if (result.success && result.data) {
        applyControlState(result.data);
      } else if (result.error) {
        setUpdateError(result.error);
      }
    } catch (err) {
      setUpdateError(err.message || 'Update failed');
    } finally {
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
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
