import React from 'react';
import { Container, Button } from 'react-bootstrap';

const WeekNavigation = ({ currentWeekStart, onWeekChange }) => {
  // Helper function to get the Monday of a given week
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to get the Sunday of a given week
  const getWeekEnd = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(d.getFullYear(), 0, 4);
    // Calculate full weeks to nearest Thursday
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const handlePreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    onWeekChange(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    onWeekChange(nextWeek);
  };

  const handleThisWeek = () => {
    const now = new Date();
    const thisWeekStart = getWeekStart(now);
    onWeekChange(thisWeekStart);
  };

  const formatWeekDisplay = (weekStart) => {
    const weekEnd = getWeekEnd(weekStart);
    const weekNumber = getWeekNumber(weekStart);
    
    // Check if this is the current week
    const now = new Date();
    const thisWeekStart = getWeekStart(now);
    const isThisWeek = weekStart.toDateString() === thisWeekStart.toDateString();
    
    // Format dates
    const startFormat = weekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    
    const endFormat = weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const prefix = isThisWeek ? 'This Week' : `Week ${weekNumber}`;
    
    return `${prefix}, ${startFormat} to ${endFormat}`;
  };

  return (
    <Container fluid className="pt-4 pb-2">
      <Container>
        <div className="d-flex align-items-center justify-content-center gap-3">
          {/* Previous Week Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handlePreviousWeek}
            className="d-flex align-items-center"
          >
            <i className="bi bi-chevron-left"></i>
            <span className="d-none d-sm-inline ms-1">Previous</span>
          </Button>

          {/* Week Display */}
          <div className="text-center px-4">
            <h4 className="mb-0 fw-bold">{formatWeekDisplay(currentWeekStart)}</h4>
          </div>

          {/* This Week Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleThisWeek}
            className="d-flex align-items-center"
          >
            <span>This Week</span>
          </Button>

          {/* Next Week Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleNextWeek}
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

export default WeekNavigation;