import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import TimeEntryForm from './TimeEntryForm';
import TimeEntriesList from './TimeEntriesList';
import DayNavigation from './DayNavigation';
import WeekNavigation from './WeekNavigation';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    // Helper function to get the Monday of a given week
    const getWeekStart = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
      return new Date(d.setDate(diff));
    };
    return getWeekStart(new Date());
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleWeekChange = (weekStart) => {
    setSelectedWeekStart(weekStart);
  };

  const handleEntryAdded = (newEntry) => {
    // Force TimeEntriesList to refresh by changing the key
    setRefreshKey(prev => prev + 1);
  };

  const renderDayView = () => (
    <>
      <DayNavigation 
        currentDate={selectedDate} 
        onDateChange={handleDateChange} 
      />
      <TimeEntryForm 
        selectedDate={selectedDate} 
        onEntryAdded={handleEntryAdded}
      />
      <TimeEntriesList 
        key={refreshKey}
        selectedDate={selectedDate} 
      />
    </>
  );

  const renderWeekView = () => {
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(selectedWeekStart.getDate() + 6);

    return (
      <>
        <WeekNavigation 
          currentWeekStart={selectedWeekStart} 
          onWeekChange={handleWeekChange} 
        />
        <TimeEntryForm 
          selectedDate={selectedDate}
          viewMode="week"
          weekStart={selectedWeekStart}
          weekEnd={weekEnd}
          onEntryAdded={handleEntryAdded}
        />
        <TimeEntriesList 
          key={refreshKey}
          selectedDate={selectedDate}
          viewMode="week"
          weekStart={selectedWeekStart}
          weekEnd={weekEnd}
        />
      </>
    );
  };

  return (
    <>
      {/* Page Header */}
      <Container fluid className="py-4">
        <Container>
          <div className="mb-4">
            <h1 className="mb-1 fw-bold">
              {activeTab === 'day' ? 'Daily Entries' : 'Weekly Entries'}
            </h1>
            <p className="text-muted mb-0">
              {activeTab === 'day' 
                ? 'Track your time across projects and tasks for a specific day.' 
                : 'Track your time across projects and tasks for a specific week.'}
            </p>
          </div>
        </Container>
      </Container>

      {/* Tab Navigation */}
      <Container fluid className="border-bottom bg-light">
        <Container>
          <Nav variant="tabs" className="border-0">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'day'}
                onClick={() => handleTabSelect('day')}
                className={`px-4 py-3 ${activeTab === 'day' ? 'border-bottom-0' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-calendar-day me-2"></i>
                Day
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'week'}
                onClick={() => handleTabSelect('week')}
                className={`px-4 py-3 ${activeTab === 'week' ? 'border-bottom-0' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-calendar-week me-2"></i>
                Week
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Container>

      {/* Tab Content */}
      {activeTab === 'day' && renderDayView()}
      {activeTab === 'week' && renderWeekView()}
    </>
  );
};

export default Dashboard;