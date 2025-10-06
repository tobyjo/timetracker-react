import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const TimeEntryForm = () => {
  const { currentUserId } = useUser();
  const [formData, setFormData] = useState({
    project: '',
    segment: 'Development',
    startTime: '',
    endTime: ''
  });
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchUserProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectsError(null);
      const response = await fetch(`https://localhost:7201/api/user/${currentUserId}/projects`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userWithProjects = await response.json();
      setProjects(userWithProjects.projects || []);
      
      // Set first project as default if available
      if (userWithProjects.projects && userWithProjects.projects.length > 0) {
        setFormData(prev => ({
          ...prev,
          project: userWithProjects.projects[0].id.toString()
        }));
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjectsError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchUserProjects();
    }
  }, [currentUserId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form data:', formData);
  };

  return (
    <Container fluid className="py-4">
      <Container>
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h3 className="mb-4 fw-bold">New Time Entry</h3>
            
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                {/* Project Dropdown */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Project
                    </Form.Label>
                    <Form.Select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      size="lg"
                      disabled={loadingProjects}
                    >
                      {loadingProjects ? (
                        <option>Loading projects...</option>
                      ) : projectsError ? (
                        <option>Error loading projects</option>
                      ) : projects.length === 0 ? (
                        <option>No projects available</option>
                      ) : (
                        <>
                          <option value="">Select a project</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.code} - {project.description}
                            </option>
                          ))}
                        </>
                      )}
                    </Form.Select>
                    {loadingProjects && (
                      <div className="mt-1">
                        <Spinner animation="border" size="sm" variant="primary" />
                        <span className="ms-2 text-muted small">Loading projects...</span>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Segment Dropdown */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Segment
                    </Form.Label>
                    <Form.Select
                      name="segment"
                      value={formData.segment}
                      onChange={handleInputChange}
                      size="lg"
                    >
                      <option value="Development">Development</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Planning">Planning</option>
                      <option value="Testing">Testing</option>
                      <option value="Design">Design</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Start Time */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Start Time
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </Form.Group>
                </Col>

                {/* End Time */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      End Time
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </Form.Group>
                </Col>

                {/* Add Button */}
                <Col md={2}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                  >
                    <i className="bi bi-plus-lg"></i>
                    Add
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default TimeEntryForm;