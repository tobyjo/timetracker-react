import React, { useState } from 'react';
import { Container, Card, Nav, Tab } from 'react-bootstrap';
import ProjectCodes from './ProjectCodes';
import SegmentTypes from './SegmentTypes';

const TeamSettings = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <Container fluid className="py-4">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            <i className="bi bi-gear me-2"></i>
            Team Settings
          </h2>
        </div>

        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link eventKey="projects" className="fw-medium">
                    <i className="bi bi-folder me-2"></i>
                    Project Codes
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="segments" className="fw-medium">
                    <i className="bi bi-pie-chart me-2"></i>
                    Segment Types
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Tab.Container>
          </Card.Header>
          
          <Card.Body className="p-0">
            {activeTab === 'projects' && <ProjectCodes />}
            {activeTab === 'segments' && <SegmentTypes />}
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default TeamSettings;
