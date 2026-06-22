import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

import { Home } from './pages/Home';

// Placeholder Pages
import { Borrowers } from './pages/Borrowers';
import { BorrowerDetails } from './pages/BorrowerDetails';
import { LoanDetails } from './pages/LoanDetails';
import { Wallet } from './pages/Wallet';

import { Reports } from './pages/Reports';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center mesh-bg gap-3 animate-fade-in">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <span className="text-xl font-bold">₹</span>
          <span className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping" />
        </div>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="finmanager-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/" element={<Home />} />
              <Route path="/borrowers" element={<Borrowers />} />
              <Route path="/borrowers/:id" element={<BorrowerDetails />} />
              <Route path="/loans/:id" element={<LoanDetails />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
