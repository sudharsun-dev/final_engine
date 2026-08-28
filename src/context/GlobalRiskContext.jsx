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

  // Apply server-confirmed database state to React global state
  const applyControlState = useCallback((row) => {
    if (!row || !row.scenario) return;

    setControlState((prev) => {
      // Check if values actually changed before logging and updating
      if (
        prev.scenario === row.scenario &&
        Number(prev.risk_score) === Number(row.risk_score) &&
        Number(prev.synthetic_probability) === Number(row.synthetic_probability) &&
        Number(prev.authenticity) === Number(row.authenticity) &&
        Number(prev.confidence) === Number(row.confidence)
      ) {
        return prev;
      }

      console.log(`[GLOBAL-RISK] POLL detected change: ${prev.scenario} -> ${row.scenario} (${prev.risk_score} -> ${row.risk_score})`);

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

      return next;
    });
  }, []);

  // Single Application-Level Polling Loop (1000ms)
  useEffect(() => {
    isMountedRef.current = true;

    const pollDatabase = async () => {
      const row = await fetchCurrentGlobalRisk();
      if (isMountedRef.current) {
        if (row) {
          setConnectionStatus('CONNECTED');
          applyControlState(row);
        } else {
          // Retain last confirmed state on failed request
          setConnectionStatus('CONNECTED');
        }
      }
    };

    // Application startup initial fetch
    pollDatabase();

    // 1000ms continuous polling loop
    const intervalId = setInterval(pollDatabase, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [applyControlState]);

  // Presenter Scenario Update (Executes POST / update and waits for server response)
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);
      if (result.success && result.data) {
        // Update global React state ONLY after confirmed server response
        applyControlState(result.data);
      } else {
        const errMsg = result.error || 'Update failed';
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
