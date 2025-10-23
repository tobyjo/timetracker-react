import React, { useState, useRef } from 'react';
import { Container, Card, Row, Col, Button, Form } from 'react-bootstrap';

const DayNavigation = ({ currentDate, onDateChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef(null);

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

  const handleDatePickerClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.showPicker?.();
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value + 'T00:00:00');
    onDateChange(selectedDate);
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    <Container fluid className="pt-4 pb-2">
      <Container>
        <div className="d-flex align-items-center justify-content-center gap-3">
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

          {/* Date Picker Button */}
          <div className="position-relative">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleDatePickerClick}
              className="d-flex align-items-center"
            >
              <i className="bi bi-calendar3"></i>
              <span className="d-none d-sm-inline ms-1">Pick Date</span>
            </Button>
            <Form.Control
              ref={dateInputRef}
              type="date"
              value={formatDateForInput(currentDate)}
              onChange={handleDateChange}
              className="position-absolute opacity-0"
              style={{ 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none' 
              }}
            />
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