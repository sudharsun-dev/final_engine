import React, { createContext, useContext } from 'react';
import { useGlobalCall } from './GlobalCallContext';

export const GlobalRiskContext = createContext(null);

export const GlobalRiskProvider = ({ children }) => {
  const callState = useGlobalCall();

  const contextValue = {
    scenario: callState.scenario,
    riskScore: callState.riskScore,
    syntheticProbability: callState.syntheticProbability,
    authenticity: callState.authenticity,
    confidence: callState.confidence,
    riskLevel: callState.riskLevel,
    recommendedAction: callState.recommendedAction,
    updatedAt: callState.activeCall?.updated_at || new Date().toISOString(),
    connectionStatus: 'CONNECTED',
    isUpdating: callState.isUpdatingCall,
    updateError: null,
    updateScenario: callState.updateCallScenario,
    isConfigured: true
  };

  return (
    <GlobalRiskContext.Provider value={contextValue}>
      {children}
    </GlobalRiskContext.Provider>
  );
};
