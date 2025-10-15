import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import CurrentUser from './components/CurrentUser';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import { UserProvider } from './contexts/UserContext';

function App() {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="flex-grow-1">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user" element={<CurrentUser />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App
