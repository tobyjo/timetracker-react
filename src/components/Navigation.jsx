import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';

const Navigation = () => {
  const { logout, user } = useAuth0();

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="px-0">
      <Container fluid className="px-3">
        <LinkContainer to="/dashboard">
          <Navbar.Brand className="fw-bold fs-4">
            <i className="bi bi-clock me-2"></i>
            TimeTracker
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <LinkContainer to="/dashboard">
              <Nav.Link className="px-3 fw-medium">Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/reports">
              <Nav.Link className="px-3 fw-medium">Reports</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/team-settings">
              <Nav.Link className="px-3 fw-medium">Team Settings</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/settings">
              <Nav.Link className="px-3 fw-medium">Settings</Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav className="ms-auto">
            <NavDropdown
              title={
                <div 
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-person-fill text-primary fs-5"></i>
                </div>
              }
              id="user-dropdown"
              align="end"
              className="p-1"
            >
              <NavDropdown.Header>
                <div className="text-center">
                  <div className="fw-bold text-primary">
                    {user?.name || user?.email || 'User'}
                  </div>
                  {user?.email && user?.name && (
                    <small className="text-muted">{user.email}</small>
                  )}
                </div>
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <LinkContainer to="/user">
                <NavDropdown.Item>
                  <i className="bi bi-person me-2"></i>
                  Profile
                </NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/settings">
                <NavDropdown.Item>
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Log Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;