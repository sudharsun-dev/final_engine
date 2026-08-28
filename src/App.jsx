import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalRiskProvider } from './context/GlobalRiskContext';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LiveAnalysis } from './pages/LiveAnalysis';
import { TransactionRisk } from './pages/TransactionRisk';
import { RiskAlerts } from './pages/RiskAlerts';
import { Policies } from './pages/Policies';
import { AuditLog } from './pages/AuditLog';
import { SystemHealth } from './pages/SystemHealth';
import { ApiDocs } from './pages/ApiDocs';

export function App() {
  return (
    <GlobalRiskProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live-analysis" element={<LiveAnalysis />} />
              <Route path="/transaction-risk" element={<TransactionRisk />} />
              <Route path="/risk-alerts" element={<RiskAlerts />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/audit-log" element={<AuditLog />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GlobalRiskProvider>
  );
}

export default App;
