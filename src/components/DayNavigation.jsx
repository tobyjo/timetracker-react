import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';

const DayNavigation = ({ currentDate, onDateChange }) => {
  const handlePreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formatDateDisplay = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Container fluid className="py-4">
      <Container>
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col>
                <h2 className="mb-1 fw-bold">Daily Entries</h2>
                <p className="text-muted mb-0">Track your time across projects and tasks for a specific day.</p>
              </Col>
              <Col xs="auto">
                <div className="d-flex align-items-center gap-3">
                  {/* Previous Day Button */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handlePreviousDay}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-chevron-left"></i>
                    <span className="d-none d-sm-inline ms-1">Previous</span>
                  </Button>

                  {/* Date Display */}
                  <div className="text-center px-3">
                    <h4 className="mb-0 fw-bold">{formatDateDisplay(currentDate)}</h4>
                  </div>

                  {/* Today Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleToday}
                    className="d-flex align-items-center"
                  >
                    <span>Today</span>
                  </Button>

                  {/* Next Day Button */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleNextDay}
                    className="d-flex align-items-center"
                  >
                    <span className="d-none d-sm-inline me-1">Next</span>
                    <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default DayNavigation;