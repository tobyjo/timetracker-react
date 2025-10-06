import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';

const TimeEntryForm = () => {
  const [formData, setFormData] = useState({
    project: 'Website Redesign',
    segment: 'Development',
    startTime: '',
    endTime: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
                    >
                      <option value="Website Redesign">Website Redesign</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Marketing Campaign">Marketing Campaign</option>
                      <option value="Backend API">Backend API</option>
                    </Form.Select>
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