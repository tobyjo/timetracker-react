import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../contexts/UserContext';
import { Card, Container, Button, Alert } from 'react-bootstrap';

const AuthDebugger = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const { currentUserId, currentUser, makeAuthenticatedRequest } = useUser();

  const testTokenRetrieval = async () => {
    try {
      console.log('🧪 Testing token retrieval...');
      const token = await getAccessTokenSilently();
      console.log('✅ Token test successful:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      alert('Token retrieved successfully! Check console for details.');
    } catch (error) {
      console.error('❌ Token test failed:', error);
      alert(`Token retrieval failed: ${error.message}`);
    }
  };

  const testApiCall = async () => {
    try {
      console.log('🧪 Testing API call...');
      const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/projects`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API test successful:', data);
        alert('API call successful! Check console for details.');
      } else {
        console.error('❌ API test failed:', response.status, response.statusText);
        alert(`API call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('💥 API test error:', error);
      alert(`API call error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-3">
        <Alert variant="info">Loading Auth0 state...</Alert>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="mt-3">
        <Alert variant="warning">Not authenticated - please log in first.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header>
          <h5 className="mb-0">🔍 Auth0 Debug Information</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <h6>Auth0 State:</h6>
              <ul className="list-unstyled">
                <li><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</li>
                <li><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}</li>
                <li><strong>User ID (sub):</strong> <code>{user?.sub || 'None'}</code></li>
                <li><strong>Email:</strong> {user?.email || 'None'}</li>
                <li><strong>Name:</strong> {user?.name || 'None'}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Context State:</h6>
              <ul className="list-unstyled">
                <li><strong>Current User ID:</strong> <code>{currentUserId || 'None'}</code></li>
                <li><strong>Is Logged In:</strong> {currentUserId ? '✅ Yes' : '❌ No'}</li>
                <li><strong>User Name:</strong> {currentUser?.userName || 'None'}</li>
                <li><strong>Full Name:</strong> {currentUser?.fullName || 'None'}</li>
              </ul>
            </div>
          </div>

          <hr />

          <div className="row">
            <div className="col-md-6">
              <h6>Environment:</h6>
              <ul className="list-unstyled">
                <li><strong>API Base URL:</strong> <code>{import.meta.env.VITE_API_BASE_URL}</code></li>
                <li><strong>Current Origin:</strong> <code>{window.location.origin}</code></li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Debug Actions:</h6>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="outline-primary" size="sm" onClick={testTokenRetrieval}>
                  Test Token
                </Button>
                <Button variant="outline-success" size="sm" onClick={testApiCall} disabled={!currentUserId}>
                  Test API Call
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => console.log('Full user object:', user)}>
                  Log User Object
                </Button>
              </div>
            </div>
          </div>

          <Alert variant="info" className="mt-3 mb-0">
            <strong>💡 Debugging Tips:</strong>
            <ul className="mb-0 mt-2">
              <li>Open browser DevTools Console (F12) to see detailed logs</li>
              <li>Click "Test Token" to verify Auth0 token retrieval</li>
              <li>Click "Test API Call" to test authenticated API request</li>
              <li>Check Network tab to see actual HTTP requests and responses</li>
            </ul>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuthDebugger;