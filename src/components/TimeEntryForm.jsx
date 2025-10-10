import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const TimeEntryForm = ({ selectedDate, viewMode = 'day', weekStart = null, weekEnd = null, onEntryAdded }) => {
  const { currentUserId } = useUser();
  const [formData, setFormData] = useState({
    project: '',
    segment: '',
    selectedDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    startTime: '',
    endTime: ''
  });
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  
  const [segmentTypes, setSegmentTypes] = useState([]);
  const [loadingSegmentTypes, setLoadingSegmentTypes] = useState(true);
  const [segmentTypesError, setSegmentTypesError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const validateDate = () => {
    if (viewMode !== 'week') {
      return { isValid: true, message: '' };
    }
    
    if (!formData.selectedDate || !weekStart || !weekEnd) {
      return { isValid: false, message: 'Date is required' };
    }
    
    const selectedDate = new Date(formData.selectedDate);
    const startOfWeek = new Date(weekStart);
    const endOfWeek = new Date(weekEnd);
    
    // Set all dates to start of day for comparison
    selectedDate.setHours(0, 0, 0, 0);
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(0, 0, 0, 0);
    
    if (selectedDate < startOfWeek || selectedDate > endOfWeek) {
      return { isValid: false, message: 'Date must be within the current week' };
    }
    
    return { isValid: true, message: '' };
  };

  const isFormValid = () => {
    const hasProject = formData.project !== '';
    const hasSegment = formData.segment !== '';
    const hasStartTime = formData.startTime !== '';
    const hasEndTime = formData.endTime !== '';
    const timeRangeValid = validateTimeRange().isValid;
    const dateValid = validateDate().isValid;
    
    return hasProject && hasSegment && hasStartTime && hasEndTime && timeRangeValid && dateValid;
  };

  const getValidationMessage = () => {
    if (!formData.project) return 'Please select a project';
    if (!formData.segment) return 'Please select a segment';
    if (viewMode === 'week' && !formData.selectedDate) return 'Please select a date';
    if (!formData.startTime) return 'Please enter a start time';
    if (!formData.endTime) return 'Please enter an end time';
    
    const dateValidation = validateDate();
    if (!dateValidation.isValid && dateValidation.message) {
      return dateValidation.message;
    }
    
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/projects`);
      
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/segmenttypes`);
      
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

  useEffect(() => {
    // Update selectedDate in formData when props change
    if (viewMode === 'day' && selectedDate) {
      setFormData(prev => ({
        ...prev,
        selectedDate: selectedDate.toISOString().split('T')[0]
      }));
    } else if (viewMode === 'week' && weekStart) {
      // Default to Monday (weekStart) for week view
      setFormData(prev => ({
        ...prev,
        selectedDate: weekStart.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate, weekStart, viewMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Create datetime objects for the selected date with the form times
      // We need to create the date in local time and format it properly
      const dateToUse = viewMode === 'week' ? new Date(formData.selectedDate) : selectedDate;
      const year = dateToUse.getFullYear();
      const month = dateToUse.getMonth();
      const day = dateToUse.getDate();
      
      const [startHours, startMinutes] = formData.startTime.split(':');
      const startDateTime = new Date(year, month, day, parseInt(startHours), parseInt(startMinutes), 0, 0);

      const [endHours, endMinutes] = formData.endTime.split(':');
      const endDateTime = new Date(year, month, day, parseInt(endHours), parseInt(endMinutes), 0, 0);

      // Format as ISO string but preserve local time intent
      const formatLocalDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      // Prepare the request body
      const requestBody = {
        ProjectId: parseInt(formData.project),
        SegmentTypeId: parseInt(formData.segment),
        StartDateTime: formatLocalDateTime(startDateTime),
        EndDateTime: formatLocalDateTime(endDateTime)
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/timeentries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTimeEntry = await response.json();
      
      // Clear the form
      setFormData({
        project: projects.length > 0 ? projects[0].id.toString() : '',
        segment: segmentTypes.length > 0 ? segmentTypes[0].id.toString() : '',
        selectedDate: viewMode === 'week' && weekStart ? weekStart.toISOString().split('T')[0] : (selectedDate ? selectedDate.toISOString().split('T')[0] : ''),
        startTime: '',
        endTime: ''
      });

      // Notify parent component to refresh the list
      if (onEntryAdded) {
        onEntryAdded(newTimeEntry);
      }

    } catch (err) {
      console.error('Failed to create time entry:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="py-2">
      <Container>
        <Card className="border-0 shadow-sm mb-4">            
          <Card.Body className="p-2">
            {/*
            <h3 className="mb-4 fw-bold">New Time Entry</h3>
            */}
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                {/* Project Dropdown */}
                <Col md={viewMode === 'week' ? 2 : 3}>
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
                              {project.code}
                            </option>
                          ))}
                        </>
                      )}
                    </Form.Select>
                    {/* Reserved space for consistent alignment */}
                    <div style={{ height: '1.25rem' }}>
                      {loadingProjects && (
                        <div className="mt-1">
                          <Spinner animation="border" size="sm" variant="primary" />
                          <span className="ms-2 text-muted small">Loading projects...</span>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>

                {/* Segment Dropdown */}
                <Col md={viewMode === 'week' ? 2 : 3}>
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
                    {/* Reserved space for consistent alignment */}
                    <div style={{ height: '1.25rem' }}>
                      {loadingSegmentTypes && (
                        <div className="mt-1">
                          <Spinner animation="border" size="sm" variant="primary" />
                          <span className="ms-2 text-muted small">Loading segments...</span>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>

                {/* Date Input - Only for week view */}
                {viewMode === 'week' && (
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-muted small">
                        Date <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="selectedDate"
                        value={formData.selectedDate}
                        onChange={handleInputChange}
                        size="lg"
                        min={weekStart ? weekStart.toISOString().split('T')[0] : ''}
                        max={weekEnd ? weekEnd.toISOString().split('T')[0] : ''}
                        isInvalid={viewMode === 'week' && !validateDate().isValid}
                      />
                      {/* Reserved space for error message - always present to prevent layout shift */}
                      <div className="small text-danger" style={{ height: '1.25rem', lineHeight: '1.25rem' }}>
                        {viewMode === 'week' && !validateDate().isValid 
                          ? validateDate().message 
                          : '\u00A0'} {/* Non-breaking space to maintain height */}
                      </div>
                    </Form.Group>
                  </Col>
                )}

                {/* Start Time */}
                <Col md={viewMode === 'week' ? 2 : 2}>
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
                    {/* Reserved space for consistent alignment */}
                    <div style={{ height: '1.25rem' }}>
                      {/* Empty space to maintain layout consistency */}
                    </div>
                  </Form.Group>
                </Col>

                {/* End Time */}
                <Col md={viewMode === 'week' ? 2 : 2}>
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
                    {/* Reserved space for error message - always present to prevent layout shift */}
                    <div className="small text-danger" style={{ height: '1.25rem', lineHeight: '1.25rem' }}>
                      {formData.startTime && formData.endTime && !validateTimeRange().isValid 
                        ? validateTimeRange().message 
                        : '\u00A0'} {/* Non-breaking space to maintain height */}
                    </div>
                  </Form.Group>
                </Col>

                {/* Add Button */}
                <Col md={viewMode === 'week' ? 2 : 2}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      &nbsp;
                    </Form.Label>
                    {!isFormValid() || isSubmitting ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="validation-tooltip">
                            {isSubmitting ? 'Adding time entry...' : getValidationMessage()}
                          </Tooltip>
                        }
                      >
                        <div className="w-100">
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={true}
                            className="w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ height: '48px' }}
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-plus-lg"></i>
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </OverlayTrigger>
                    ) : (
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ height: '48px' }}
                      >
                        <i className="bi bi-plus-lg"></i>
                        Add
                      </Button>
                    )}
                    {/* Reserved space for consistent alignment */}
                    <div style={{ height: '1.25rem' }}>
                      {/* Empty space to maintain layout consistency */}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            
            {/* Error display */}
            {submitError && (
              <Alert variant="danger" className="mt-3 mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Error adding time entry:</strong> {submitError}
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default TimeEntryForm;