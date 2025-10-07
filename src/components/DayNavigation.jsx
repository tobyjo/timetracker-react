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
        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
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
          <div className="text-center px-4">
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
      </Container>
    </Container>
  );
};

export default DayNavigation;