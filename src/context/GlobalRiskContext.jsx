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

  // Apply confirmed database row to React global state
  const applyControlState = useCallback((row) => {
    if (!row || !row.scenario) return;

    setControlState((prev) => {
      // If server state is identical, do not trigger redundant state update
      if (
        prev.scenario === row.scenario &&
        Number(prev.risk_score) === Number(row.risk_score) &&
        Number(prev.synthetic_probability) === Number(row.synthetic_probability) &&
        Number(prev.authenticity) === Number(row.authenticity) &&
        Number(prev.confidence) === Number(row.confidence)
      ) {
        return prev;
      }

      console.log(`[GLOBAL-RISK] poll detected change`);
      console.log(`  ${prev.scenario} -> ${row.scenario}`);
      console.log(`  ${prev.risk_score} -> ${row.risk_score}`);

      const next = {
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

      console.log('[GLOBAL-RISK] UI synchronized:', next);
      return next;
    });
  }, []);

  // Application-Level 1000ms Polling Loop
  useEffect(() => {
    isMountedRef.current = true;

    const pollDatabase = async () => {
      if (!isSupabaseConfigured) {
        setConnectionStatus('UNCONFIGURED');
        return;
      }

      const row = await fetchCurrentGlobalRisk();
      if (isMountedRef.current) {
        if (row) {
          setConnectionStatus('CONNECTED');
          applyControlState(row);
        } else {
          // If request fails, retain last confirmed state
          setConnectionStatus('CONNECTED');
        }
      }
    };

    console.log('[GLOBAL-RISK] initial fetch');
    // Initial fetch on application startup
    pollDatabase();

    // Poll every 1000ms continuously across all pages
    const intervalId = setInterval(pollDatabase, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [applyControlState]);

  // Presenter Update Method (Waits for database write completion before updating UI)
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    setIsUpdating(true);
    setUpdateError(null);

    console.log(`[GLOBAL-RISK] update started: ${targetScenarioKey}`);

    try {
      // 1. Send update to Supabase database (row id = 1)
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);

      if (result.success && result.data) {
        // 2. ONLY after successful database write response, update local React state
        console.log('[GLOBAL-RISK] update success:', result.data);
        applyControlState(result.data);
      } else {
        // 3. If database update fails: keep previous confirmed state & display error
        const errMsg = result.error || 'Database write failed';
        console.error('[GLOBAL-RISK ERROR] Update failed:', errMsg);
        setUpdateError(errMsg);
      }
    } catch (err) {
      console.error('[GLOBAL-RISK ERROR] Update exception:', err);
      setUpdateError(err.message || 'Database error');
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
