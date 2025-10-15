import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';

const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container>
        <div className="text-center">
          {/* Welcome Banner */}
          <div className="mb-5">
            <div className="mb-4">
              <i className="bi bi-clock text-primary" style={{ fontSize: '4rem' }}></i>
            </div>
            <h1 className="display-4 fw-bold text-primary mb-3">
              Welcome to TimeTracker
            </h1>
            <p className="lead text-muted mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Track your time efficiently across projects and tasks. 
              Get insights into your productivity with detailed reports and analytics.
            </p>
          </div>

          {/* Features Section */}
          <div className="row justify-content-center mb-5">
            <div className="col-md-4 mb-4">
              <div className="text-center">
                <i className="bi bi-calendar-day text-primary fs-1 mb-3"></i>
                <h5 className="fw-bold">Daily Tracking</h5>
                <p className="text-muted">
                  Log your time entries with precision and ease
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="text-center">
                <i className="bi bi-graph-up text-primary fs-1 mb-3"></i>
                <h5 className="fw-bold">Analytics</h5>
                <p className="text-muted">
                  Get detailed reports and insights into your productivity
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="text-center">
                <i className="bi bi-gear text-primary fs-1 mb-3"></i>
                <h5 className="fw-bold">Customizable</h5>
                <p className="text-muted">
                  Configure projects, tasks, and settings to fit your workflow
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleLogin}
              className="px-5 py-3 fw-bold"
              style={{ fontSize: '1.1rem' }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Get Started - Login
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-top">
            <p className="text-muted mb-0">
              Secure authentication powered by Auth0
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;