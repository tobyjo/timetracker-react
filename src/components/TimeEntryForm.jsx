import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const TimeEntryForm = ({ selectedDate, viewMode = 'day', weekStart = null, weekEnd = null, monthStart = null, monthEnd = null, onEntryAdded }) => {
  const { currentUserId, makeAuthenticatedRequest } = useUser();
  
  // Helper function to format date as YYYY-MM-DD without timezone conversion
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Memoized default date to prevent flicker during navigation
  const defaultDate = useMemo(() => {
    if (viewMode === 'month') {
      // Use first day of the displayed month
      if (monthStart) {
        const year = monthStart.getFullYear();
        const month = monthStart.getMonth();
        const firstDay = new Date(year, month, 1);
        return formatDateLocal(firstDay);
      } else {
        // Fallback to first day of current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return formatDateLocal(firstDay);
      }
    } else if (viewMode === 'week' && weekStart) {
      return formatDateLocal(weekStart);
    } else if (viewMode === 'day' && selectedDate) {
      return formatDateLocal(selectedDate);
    }
    return formatDateLocal(new Date());
  }, [viewMode, monthStart, weekStart, selectedDate]);
  
  const [formData, setFormData] = useState({
    project: '',
    segment: '',
    selectedDate: '',
    startTime: '',
    endTime: '',
    note: ''
  });
  
  // Flag to track navigation transitions and prevent validation flicker
  const [isNavigating, setIsNavigating] = useState(false);
  
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
    if (viewMode === 'day') {
      return { isValid: true, message: '' };
    }
    
    // Use the selected date from the form
    const dateToValidate = formData.selectedDate;
    if (!dateToValidate) {
      return { isValid: false, message: 'Date is required' };
    }
    
    const selectedDate = new Date(dateToValidate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (viewMode === 'week') {
      if (!weekStart || !weekEnd) {
        return { isValid: false, message: 'Date is required' };
      }
      
      const startOfWeek = new Date(weekStart);
      const endOfWeek = new Date(weekEnd);
      startOfWeek.setHours(0, 0, 0, 0);
      endOfWeek.setHours(0, 0, 0, 0);
      
      if (selectedDate < startOfWeek || selectedDate > endOfWeek) {
        return { isValid: false, message: 'Date must be within the current week' };
      }
    } else if (viewMode === 'month') {
      if (!monthStart || !monthEnd) {
        return { isValid: false, message: 'Date is required' };
      }
      
      const startOfMonth = new Date(monthStart);
      const endOfMonth = new Date(monthEnd);
      startOfMonth.setHours(0, 0, 0, 0);
      endOfMonth.setHours(0, 0, 0, 0);
      
      if (selectedDate < startOfMonth || selectedDate > endOfMonth) {
        return { isValid: false, message: 'Date must be within the current month' };
      }
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
    if ((viewMode === 'week' || viewMode === 'month') && !formData.selectedDate) return 'Please select a date';
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
      const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_BASE_URL}/api/me/projects?isVisible=true`);
      
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
      const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_BASE_URL}/api/me/segmenttypes?isVisible=true`);
      
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

  // Initialize date when component mounts or when view/date context changes
  // Only update if the date is empty or if we're changing view contexts
  useEffect(() => {
    setFormData(prev => {
      // Only set the date if it's empty (initial load or after submit)
      if (!prev.selectedDate) {
        return {
          ...prev,
          selectedDate: defaultDate
        };
      }
      return prev;
    });
  }, [defaultDate]);

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
      const dateToUse = (viewMode === 'week' || viewMode === 'month') ? new Date(formData.selectedDate) : selectedDate;
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
        EndDateTime: formatLocalDateTime(endDateTime),
        Note: formData.note
      };

      const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_BASE_URL}/api/me/timeentries`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTimeEntry = await response.json();
      
      // Clear the form but keep the same date
      setFormData(prev => ({
        project: projects.length > 0 ? projects[0].id.toString() : '',
        segment: segmentTypes.length > 0 ? segmentTypes[0].id.toString() : '',
        selectedDate: prev.selectedDate, // Keep the same date
        startTime: '',
        endTime: '',
        note: ''
      }));

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

  // Compute validation once to prevent multiple calls during render
  const dateValidation = (viewMode === 'week' || viewMode === 'month') ? validateDate() : { isValid: true, message: '' };

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
                <Col md={(viewMode === 'week' || viewMode === 'month') ? 2 : 3}>
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
                <Col md={(viewMode === 'week' || viewMode === 'month') ? 2 : 3}>
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

                {/* Date Input - For week and month view */}
                {(viewMode === 'week' || viewMode === 'month') && (
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
                        min={viewMode === 'week' 
                          ? (weekStart ? formatDateLocal(weekStart) : '')
                          : (monthStart ? formatDateLocal(monthStart) : '')}
                        max={viewMode === 'week' 
                          ? (weekEnd ? formatDateLocal(weekEnd) : '')
                          : (monthEnd ? formatDateLocal(monthEnd) : '')}
                        isInvalid={!dateValidation.isValid}
                      />
                      {/* Reserved space for error message - always present to prevent layout shift */}
                      <div className="small text-danger" style={{ height: '1.25rem', lineHeight: '1.25rem' }}>
                        {!dateValidation.isValid ? dateValidation.message : '\u00A0'} {/* Non-breaking space to maintain height */}
                      </div>
                    </Form.Group>
                  </Col>
                )}

                {/* Start Time */}
                <Col md={(viewMode === 'week' || viewMode === 'month') ? 2 : 2}>
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
                <Col md={(viewMode === 'week' || viewMode === 'month') ? 2 : 2}>
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
                <Col md={(viewMode === 'week' || viewMode === 'month') ? 2 : 2}>
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

              {/* Note Field - Second Row */}
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Note (optional)
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Add a note for this time entry..."
                      rows={2}
                      maxLength={300}
                      disabled={isSubmitting}
                      className="border"
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">Maximum 300 characters</small>
                      <small className="text-muted">{formData.note.length}/300</small>
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