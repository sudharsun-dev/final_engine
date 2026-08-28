import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { isSupabaseConfigured } from '../services/supabase.js';
import { fetchCurrentGlobalRisk, updateGlobalRiskScenario, SCENARIOS } from '../services/globalRiskService.js';
import { useAuth } from './AuthContext.jsx';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [controlState, setControlState] = useState(SCENARIOS.LOW);
  const [connectionStatus, setConnectionStatus] = useState('POLLING');
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'SYNCED' : 'UNCONFIGURED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const isMountedRef = useRef(true);

  // Apply confirmed database state to React global state
  const applyControlState = useCallback((row) => {
    if (!row || !row.scenario) return;

    setControlState((prev) => {
      // Avoid redundant re-render if database state hasn't changed
      if (
        prev.scenario === row.scenario &&
        Number(prev.risk_score) === Number(row.risk_score) &&
        Number(prev.synthetic_probability) === Number(row.synthetic_probability) &&
        Number(prev.authenticity) === Number(row.authenticity) &&
        Number(prev.confidence) === Number(row.confidence)
      ) {
        return prev;
      }

      console.log(`[GLOBAL-RISK] poll detected change: ${prev.scenario} -> ${row.scenario} (${prev.risk_score} -> ${row.risk_score})`);
      console.log('[GLOBAL-RISK] UI synchronized');

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

  // Single Application-Level 1000ms Polling Loop
  useEffect(() => {
    isMountedRef.current = true;

    const pollDatabase = async () => {
      if (!isSupabaseConfigured) {
        setConnectionStatus('UNCONFIGURED');
        setSyncStatus('UNCONFIGURED');
        return;
      }

      const row = await fetchCurrentGlobalRisk();
      if (isMountedRef.current) {
        if (row) {
          setConnectionStatus('CONNECTED');
          // Only update syncStatus to SYNCED if there isn't an active write error
          setSyncStatus((prev) => (prev === 'SYNCING' ? prev : 'SYNCED'));
          applyControlState(row);
        } else {
          setConnectionStatus('CONNECTED');
        }
      }
    };

    console.log('[GLOBAL-RISK] initial fetch');
    pollDatabase();

    // 1000ms continuous polling loop
    const intervalId = setInterval(pollDatabase, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [applyControlState]);

  // Presenter Update Method (Waits for database response before updating UI)
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    setIsUpdating(true);
    setSyncStatus('SYNCING');
    setUpdateError(null);

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);

      if (result.success && result.data) {
        // Successful database write: update React state and set status = SYNCED
        setSyncStatus('SYNCED');
        setUpdateError(null);
        applyControlState(result.data);
      } else {
        // Failed database write: set status = ERROR and show error message
        const errMsg = result.error || 'Database update failed';
        setSyncStatus('ERROR');
        setUpdateError(errMsg);
      }
    } catch (err) {
      const errMsg = err.message || 'Database error';
      setSyncStatus('ERROR');
      setUpdateError(errMsg);
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
    syncStatus,
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
