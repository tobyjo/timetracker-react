import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import CurrentUser from './components/CurrentUser';
import ErrorBoundary from './components/ErrorBoundary';
import { UserProvider } from './contexts/UserContext';

function App() {
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
