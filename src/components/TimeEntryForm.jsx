import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const TimeEntryForm = () => {
  const { currentUserId } = useUser();
  const [formData, setFormData] = useState({
    project: '',
    segment: '',
    startTime: '',
    endTime: ''
  });
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  
  const [segmentTypes, setSegmentTypes] = useState([]);
  const [loadingSegmentTypes, setLoadingSegmentTypes] = useState(true);
  const [segmentTypesError, setSegmentTypesError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation functions
  const validateTimeRange = () => {
    if (!formData.startTime || !formData.endTime) {
      return { isValid: false, message: '' };
    }
    
    const startTime = new Date(`2025-01-01T${formData.startTime}`);
    const endTime = new Date(`2025-01-01T${formData.endTime}`);
    
    if (endTime <= startTime) {
      return { isValid: false, message: 'End time must be after start time' };
    }
    
    return { isValid: true, message: '' };
  };

  const isFormValid = () => {
    const hasProject = formData.project !== '';
    const hasSegment = formData.segment !== '';
    const hasStartTime = formData.startTime !== '';
    const hasEndTime = formData.endTime !== '';
    const timeRangeValid = validateTimeRange().isValid;
    
    return hasProject && hasSegment && hasStartTime && hasEndTime && timeRangeValid;
  };

  const getValidationMessage = () => {
    if (!formData.project) return 'Please select a project';
    if (!formData.segment) return 'Please select a segment';
    if (!formData.startTime) return 'Please enter a start time';
    if (!formData.endTime) return 'Please enter an end time';
    
    const timeValidation = validateTimeRange();
    if (!timeValidation.isValid && timeValidation.message) {
      return timeValidation.message;
    }
    
    return '';
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

  const fetchUserSegmentTypes = async () => {
    try {
      setLoadingSegmentTypes(true);
      setSegmentTypesError(null);
      const response = await fetch(`https://localhost:7201/api/user/${currentUserId}/segmenttypes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userWithSegmentTypes = await response.json();
      setSegmentTypes(userWithSegmentTypes.segmentTypes || []);
      
      // Set first segment type as default if available
      if (userWithSegmentTypes.segmentTypes && userWithSegmentTypes.segmentTypes.length > 0) {
        setFormData(prev => ({
          ...prev,
          segment: userWithSegmentTypes.segmentTypes[0].id.toString()
        }));
      }
    } catch (err) {
      console.error('Failed to fetch segment types:', err);
      setSegmentTypesError(err.message);
    } finally {
      setLoadingSegmentTypes(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchUserProjects();
      fetchUserSegmentTypes();
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
                      Project <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      size="lg"
                      disabled={loadingProjects}
                      isInvalid={formData.project === ''}
                      required
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
                      Segment <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="segment"
                      value={formData.segment}
                      onChange={handleInputChange}
                      size="lg"
                      disabled={loadingSegmentTypes}
                      isInvalid={formData.segment === ''}
                      required
                    >
                      {loadingSegmentTypes ? (
                        <option>Loading segments...</option>
                      ) : segmentTypesError ? (
                        <option>Error loading segments</option>
                      ) : segmentTypes.length === 0 ? (
                        <option>No segments available</option>
                      ) : (
                        <>
                          <option value="">Select a segment</option>
                          {segmentTypes.map(segmentType => (
                            <option key={segmentType.id} value={segmentType.id}>
                              {segmentType.name}
                            </option>
                          ))}
                        </>
                      )}
                    </Form.Select>
                    {loadingSegmentTypes && (
                      <div className="mt-1">
                        <Spinner animation="border" size="sm" variant="primary" />
                        <span className="ms-2 text-muted small">Loading segments...</span>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Start Time */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Start Time <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      size="lg"
                      isInvalid={formData.startTime && formData.endTime && !validateTimeRange().isValid}
                    />
                  </Form.Group>
                </Col>

                {/* End Time */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      End Time <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      size="lg"
                      isInvalid={formData.startTime && formData.endTime && !validateTimeRange().isValid}
                    />
                    {formData.startTime && formData.endTime && !validateTimeRange().isValid && (
                      <Form.Control.Feedback type="invalid" className="small">
                        {validateTimeRange().message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                {/* Add Button */}
                <Col md={2}>
                  {!isFormValid() ? (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="validation-tooltip">
                          {getValidationMessage()}
                        </Tooltip>
                      }
                    >
                      <div className="w-100">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          disabled={true}
                          className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                        >
                          <i className="bi bi-plus-lg"></i>
                          Add
                        </Button>
                      </div>
                    </OverlayTrigger>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                    >
                      <i className="bi bi-plus-lg"></i>
                      Add
                    </Button>
                  )}
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