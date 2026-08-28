import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalCallProvider } from './context/GlobalCallContext';
import { GlobalRiskProvider } from './context/GlobalRiskContext';
import { Header } from './components/Header';
import { IncomingCallModal } from './components/IncomingCallModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveAnalysis } from './pages/LiveAnalysis';
import { TransactionRisk } from './pages/TransactionRisk';
import { RiskAlerts } from './pages/RiskAlerts';
import { Policies } from './pages/Policies';
import { AuditLog } from './pages/AuditLog';
import { SystemHealth } from './pages/SystemHealth';
import { ApiDocs } from './pages/ApiDocs';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
        AUTHENTICATING SYSTEM 2 SESSION...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <GlobalCallProvider>
        <GlobalRiskProvider>
          <BrowserRouter>
            <IncomingCallModal />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedLayout>
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
                  </ProtectedLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </GlobalRiskProvider>
      </GlobalCallProvider>
    </AuthProvider>
  );
}

export default App;
