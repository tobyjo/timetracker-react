import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Navigation = () => {
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
            <LinkContainer to="/settings">
              <Nav.Link className="px-3 fw-medium">Settings</Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav className="ms-auto">
            <LinkContainer to="/user">
              <Nav.Link className="p-1">
                <div 
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-person-fill text-primary fs-5"></i>
                </div>
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;