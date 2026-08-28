import { useContext } from 'react';
import { GlobalRiskContext } from '../context/GlobalRiskContext';

export const useGlobalRisk = () => {
  const context = useContext(GlobalRiskContext);
  if (!context) {
    throw new Error('useGlobalRisk must be used within a GlobalRiskProvider');
  }
  return context;
};
