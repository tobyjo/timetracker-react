import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI using Bootstrap components
      return (
        <Container fluid className="py-4">
          <Container>
            <Alert variant="danger" className="mb-4">
              <Alert.Heading className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                Something went wrong
              </Alert.Heading>
              <p className="mb-3">
                An unexpected error occurred while rendering this component. 
                Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="fw-bold text-decoration-underline" style={{ cursor: 'pointer' }}>
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-3 bg-light border rounded small text-danger">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <hr />
              <div className="d-flex gap-2 mb-0">
                <Button variant="outline-danger" onClick={this.handleRetry}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Try Again
                </Button>
                <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Refresh Page
                </Button>
              </div>
            </Alert>
          </Container>
        </Container>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;