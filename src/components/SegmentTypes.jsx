import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const SegmentTypes = () => {
  const { currentUserId, makeAuthenticatedRequest } = useUser();
  
  const [segmentTypes, setSegmentTypes] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHidden, setShowHidden] = useState(false);
  
  // Form state for adding new segment type
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    description: ''
  });

  const fetchSegmentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = showHidden 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/me/segmenttypes?IsVisible=false`
        : `${import.meta.env.VITE_API_BASE_URL}/api/me/segmenttypes?IsVisible=true`;
      
      const response = await makeAuthenticatedRequest(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSegmentTypes(data.segmentTypes || []);
      
      // Extract teamId from first segment type if available
      if (data.segmentTypes && data.segmentTypes.length > 0 && data.segmentTypes[0].teamId) {
        setTeamId(data.segmentTypes[0].teamId);
      }
    } catch (err) {
      console.error('Failed to fetch segment types:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchSegmentTypes();
    }
  }, [currentUserId, showHidden]);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewSegment(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!newSegment.name.trim()) {
      setSubmitError('Segment type name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const requestBody = {
        Name: newSegment.name.trim(),
        Description: newSegment.description.trim(),
        TeamId: teamId,
        IsVisible: true
      };

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/api/me/segmenttypes`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh list
      setNewSegment({ name: '', description: '' });
      setShowAddForm(false);
      await fetchSegmentTypes();

    } catch (err) {
      console.error('Failed to create segment type:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (segment) => {
    setEditingId(segment.id);
    setEditData({
      name: segment.name,
      description: segment.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', description: '' });
  };

  const handleSaveEdit = async (segment) => {
    if (!editData.name.trim()) {
      alert('Segment type name is required');
      return;
    }

    try {
      const requestBody = {
        Name: editData.name.trim(),
        Description: editData.description.trim(),
        TeamId: segment.teamId,
        IsVisible: segment.isVisible
      };

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/api/me/segmenttypes/${segment.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEditingId(null);
      await fetchSegmentTypes();

    } catch (err) {
      console.error('Failed to update segment type:', err);
      alert(`Failed to update segment type: ${err.message}`);
    }
  };

  const handleToggleVisibility = async (segment) => {
    const action = segment.isVisible ? 'hide' : 'show';
    if (!window.confirm(`Are you sure you want to ${action} this segment type?`)) {
      return;
    }

    try {
      const requestBody = {
        Name: segment.name,
        Description: segment.description || '',
        TeamId: segment.teamId,
        IsVisible: !segment.isVisible
      };

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/api/me/segmenttypes/${segment.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchSegmentTypes();

    } catch (err) {
      console.error('Failed to toggle segment type visibility:', err);
      alert(`Failed to ${action} segment type: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading segment types...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            Unable to Load Segment Types
          </Alert.Heading>
          <p className="mb-3">
            There was a problem connecting to the server. Please check that the API is running and try again.
          </p>
          <p className="text-muted small mb-3">
            <strong>Error:</strong> {error}
          </p>
          <hr />
          <div className="d-flex gap-2 mb-0">
            <Button variant="outline-danger" onClick={fetchSegmentTypes}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header with actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">
            {showHidden ? 'Hidden Segment Types' : 'Active Segment Types'}
          </h5>
          <p className="text-muted small mb-0">
            {showHidden 
              ? 'These segment types are hidden and cannot be used for new time entries'
              : 'Manage your team\'s segment types'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant={showHidden ? 'outline-secondary' : 'outline-primary'}
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
          >
            <i className={`bi bi-eye${showHidden ? '' : '-slash'} me-2`}></i>
            {showHidden ? 'Show Active' : 'Show Hidden'}
          </Button>
          {!showHidden && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={!teamId}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Segment Type
            </Button>
          )}
        </div>
      </div>

      {/* Add New Segment Type Form */}
      {showAddForm && !showHidden && (
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-3">
            <h6 className="mb-3 fw-bold">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Segment Type
            </h6>
            <Form onSubmit={handleAddSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Segment Type Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newSegment.name}
                      onChange={handleAddInputChange}
                      placeholder="e.g., Billable, Non-Billable"
                      maxLength={50}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Description
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="description"
                      value={newSegment.description}
                      onChange={handleAddInputChange}
                      placeholder="e.g., Time that can be billed to clients"
                      maxLength={200}
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {submitError && (
                <Alert variant="danger" className="mt-3 mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Error:</strong> {submitError}
                </Alert>
              )}
              
              <div className="d-flex gap-2 mt-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !newSegment.name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Add Segment Type
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSegment({ name: '', description: '' });
                    setSubmitError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Segment Types List */}
      {segmentTypes.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          {showHidden 
            ? 'No hidden segment types found.'
            : 'No segment types found. Click "Add Segment Type" to create one.'}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '50%' }}>Description</th>
                <th style={{ width: '15%' }} className="text-center">Status</th>
                <th style={{ width: '15%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {segmentTypes.map(segment => (
                <React.Fragment key={segment.id}>
                  {editingId === segment.id ? (
                    <tr className="table-warning">
                      <td>
                        <Form.Control
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditInputChange}
                          size="sm"
                          maxLength={50}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="description"
                          value={editData.description}
                          onChange={handleEditInputChange}
                          size="sm"
                          maxLength={200}
                        />
                      </td>
                      <td className="text-center">
                        <Badge bg={segment.isVisible ? 'success' : 'secondary'}>
                          {segment.isVisible ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSaveEdit(segment)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="fw-semibold">{segment.name}</td>
                      <td className="text-muted">{segment.description || '-'}</td>
                      <td className="text-center">
                        <Badge bg={segment.isVisible ? 'success' : 'secondary'}>
                          {segment.isVisible ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="link"
                            className="text-primary text-decoration-none p-0"
                            onClick={() => handleEdit(segment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="link"
                            className={`text-decoration-none p-0 ${segment.isVisible ? 'text-warning' : 'text-success'}`}
                            onClick={() => handleToggleVisibility(segment)}
                          >
                            {segment.isVisible ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default SegmentTypes;
