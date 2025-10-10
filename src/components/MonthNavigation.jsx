import React from 'react';
import { Container, Button } from 'react-bootstrap';

const MonthNavigation = ({ currentMonthStart, onMonthChange }) => {
  // Helper function to get the first day of a given month
  const getMonthStart = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Helper function to get the last day of a given month
  const getMonthEnd = (monthStart) => {
    return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  };

  const handlePreviousMonth = () => {
    const year = currentMonthStart.getFullYear();
    const month = currentMonthStart.getMonth() - 1;
    const previousMonthStart = new Date(year, month, 1);
    onMonthChange(previousMonthStart);
  };

  const handleNextMonth = () => {
    const year = currentMonthStart.getFullYear();
    const month = currentMonthStart.getMonth() + 1;
    const nextMonthStart = new Date(year, month, 1);
    onMonthChange(nextMonthStart);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const thisMonthStart = getMonthStart(now);
    onMonthChange(thisMonthStart);
  };

  const formatMonthDisplay = (monthStart) => {
    // Check if this is the current month
    const now = new Date();
    const thisMonthStart = getMonthStart(now);
    const isThisMonth = monthStart.getFullYear() === thisMonthStart.getFullYear() && 
                       monthStart.getMonth() === thisMonthStart.getMonth();
    
    // Format month and year
    const monthYear = monthStart.toLocaleDateString('en-US', { 
      month: 'long',
      year: 'numeric'
    });
    
    return isThisMonth ? `This Month, ${monthYear}` : monthYear;
  };

  return (
    <Container fluid className="pt-4 pb-2">
      <Container>
        <div className="d-flex align-items-center justify-content-center gap-3">
          {/* Previous Month Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handlePreviousMonth}
            className="d-flex align-items-center"
          >
            <i className="bi bi-chevron-left"></i>
            <span className="d-none d-sm-inline ms-1">Previous</span>
          </Button>

          {/* Month Display */}
          <div className="text-center px-4">
            <h4 className="mb-0 fw-bold">{formatMonthDisplay(currentMonthStart)}</h4>
          </div>

          {/* This Month Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleThisMonth}
            className="d-flex align-items-center"
          >
            <span>This Month</span>
          </Button>

          {/* Next Month Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleNextMonth}
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

export default MonthNavigation;