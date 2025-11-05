import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const ProjectCodes = () => {
  const { currentUserId, makeAuthenticatedRequest } = useUser();
  
  const [projects, setProjects] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHidden, setShowHidden] = useState(false);
  
  // Form state for adding new project
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    code: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    code: '',
    description: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = showHidden 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/me/projects?IsVisible=false`
        : `${import.meta.env.VITE_API_BASE_URL}/api/me/projects?IsVisible=true`;
      
      const response = await makeAuthenticatedRequest(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
      
      // Extract teamId from first project if available
      if (data.projects && data.projects.length > 0 && data.projects[0].teamId) {
        setTeamId(data.projects[0].teamId);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchProjects();
    }
  }, [currentUserId, showHidden]);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
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
    
    if (!newProject.code.trim()) {
      setSubmitError('Project code is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const requestBody = {
        Code: newProject.code.trim(),
        Description: newProject.description.trim(),
        TeamId: teamId,
        IsVisible: true
      };

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/api/me/projects`,
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
      setNewProject({ code: '', description: '' });
      setShowAddForm(false);
      await fetchProjects();

    } catch (err) {
      console.error('Failed to create project:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setEditData({
      code: project.code,
      description: project.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ code: '', description: '' });
  };

  const handleSaveEdit = async (project) => {
    if (!editData.code.trim()) {
      alert('Project code is required');
      return;
    }

    try {
      const requestBody = {
        Code: editData.code.trim(),
        Description: editData.description.trim(),
        TeamId: project.teamId,
        IsVisible: project.isVisible
      };

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/api/me/projects/${project.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEditingId(null);
      await fetchProjects();

    } catch (err) {
      console.error('Failed to update project:', err);
      alert(`Failed to update project: ${err.message}`);
    }
  };

  const handleToggleVisibility = async (project) => {
    const action = project.isVisible ? 'hide' : 'show';
    if (!window.confirm(`Are you sure you want to ${action} this project code?`)) {
      return;
    }

    try {
      const requestBody = {
        Code: project.code,
        Description: project.description || '',
        TeamId: project.teamId,
        IsVisible: !project.isVisible
      };

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/api/me/projects/${project.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchProjects();

    } catch (err) {
      console.error('Failed to toggle project visibility:', err);
      alert(`Failed to ${action} project: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading project codes...</p>
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
            Unable to Load Project Codes
          </Alert.Heading>
          <p className="mb-3">
            There was a problem connecting to the server. Please check that the API is running and try again.
          </p>
          <p className="text-muted small mb-3">
            <strong>Error:</strong> {error}
          </p>
          <hr />
          <div className="d-flex gap-2 mb-0">
            <Button variant="outline-danger" onClick={fetchProjects}>
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
            {showHidden ? 'Hidden Project Codes' : 'Active Project Codes'}
          </h5>
          <p className="text-muted small mb-0">
            {showHidden 
              ? 'These project codes are hidden and cannot be used for new time entries'
              : 'Manage your team\'s project codes'}
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
              Add Project Code
            </Button>
          )}
        </div>
      </div>

      {/* Add New Project Form */}
      {showAddForm && !showHidden && (
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-3">
            <h6 className="mb-3 fw-bold">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Project Code
            </h6>
            <Form onSubmit={handleAddSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-muted small">
                      Project Code <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={newProject.code}
                      onChange={handleAddInputChange}
                      placeholder="e.g., BPC, MAG"
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
                      value={newProject.description}
                      onChange={handleAddInputChange}
                      placeholder="e.g., Berkshire Primary Care"
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
                  disabled={isSubmitting || !newProject.code.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Add Project
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProject({ code: '', description: '' });
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

      {/* Projects List */}
      {projects.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          {showHidden 
            ? 'No hidden project codes found.'
            : 'No project codes found. Click "Add Project Code" to create one.'}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '20%' }}>Code</th>
                <th style={{ width: '50%' }}>Description</th>
                <th style={{ width: '15%' }} className="text-center">Status</th>
                <th style={{ width: '15%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <React.Fragment key={project.id}>
                  {editingId === project.id ? (
                    <tr className="table-warning">
                      <td>
                        <Form.Control
                          type="text"
                          name="code"
                          value={editData.code}
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
                        <Badge bg={project.isVisible ? 'success' : 'secondary'}>
                          {project.isVisible ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSaveEdit(project)}
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
                      <td className="fw-semibold">{project.code}</td>
                      <td className="text-muted">{project.description || '-'}</td>
                      <td className="text-center">
                        <Badge bg={project.isVisible ? 'success' : 'secondary'}>
                          {project.isVisible ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="link"
                            className="text-primary text-decoration-none p-0"
                            onClick={() => handleEdit(project)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="link"
                            className={`text-decoration-none p-0 ${project.isVisible ? 'text-warning' : 'text-success'}`}
                            onClick={() => handleToggleVisibility(project)}
                          >
                            {project.isVisible ? 'Hide' : 'Show'}
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

export default ProjectCodes;
