import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { isSupabaseConfigured } from '../services/supabase.js';
import { fetchCurrentGlobalRisk, updateGlobalRiskScenario, SCENARIOS } from '../services/globalRiskService.js';
import { useAuth } from './AuthContext.jsx';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  // Initial state is null until first confirmed database fetch
  const [controlState, setControlState] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('POLLING');
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'CONNECTING' : 'UNCONFIGURED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const isMountedRef = useRef(true);

  // Apply confirmed database state to React global state
  const applyControlState = useCallback((row) => {
    if (!row || !row.scenario) return;

    setControlState((prev) => {
      // First load when prev is null
      if (!prev) {
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
      }

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

      console.log('[GLOBAL-RISK POLL]', {
        previous: prev.scenario,
        database: row.scenario,
        changed: true
      });

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

  // Application-Level 1000ms Polling Loop
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
          setSyncStatus((prev) => (prev === 'SYNCING' ? prev : 'SYNCED'));
          setUpdateError(null);
          applyControlState(row);
        } else {
          // If request fails: keep LAST VALID DATABASE STATE. Do NOT reset to null, LOW, or OFF.
          setConnectionStatus('CONNECTED');
          if (!controlState) {
            setSyncStatus('ERROR');
          }
        }
      }
    };

    pollDatabase();

    // 1000ms continuous polling loop owned strictly by GlobalRiskProvider
    const intervalId = setInterval(pollDatabase, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [applyControlState, controlState]);

  // Presenter Update Method (Executes DB write FIRST; updates UI ONLY after success)
  const updateScenario = async (targetScenarioKey) => {
    if (!SCENARIOS[targetScenarioKey]) return;

    const updatedBy = currentUser?.full_name || 'Presenter';
    setIsUpdating(true);
    setSyncStatus('SYNCING');
    setUpdateError(null);

    try {
      const result = await updateGlobalRiskScenario(targetScenarioKey, updatedBy);

      if (result.success && result.data) {
        // Successful write: update state and set syncStatus = SYNCED
        setSyncStatus('SYNCED');
        setUpdateError(null);
        applyControlState(result.data);
      } else {
        // Failed write: retain previous confirmed state & set syncStatus = ERROR
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

  // Safe fallback getters when controlState is null during initial loading
  const contextValue = {
    controlState,
    scenario: controlState ? controlState.scenario : 'LOADING',
    riskScore: controlState ? controlState.risk_score : 0,
    syntheticProbability: controlState ? controlState.synthetic_probability : 0,
    authenticity: controlState ? controlState.authenticity : 0,
    confidence: controlState ? controlState.confidence : 0,
    riskLevel: controlState ? controlState.risk_level : 'LOADING',
    recommendedAction: controlState ? controlState.recommended_action : 'LOADING',
    updatedBy: controlState ? controlState.updated_by : 'System',
    updatedAt: controlState ? controlState.updated_at : null,
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
