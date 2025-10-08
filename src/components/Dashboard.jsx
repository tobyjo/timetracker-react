import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import TimeEntryForm from './TimeEntryForm';
import TimeEntriesList from './TimeEntriesList';
import DayNavigation from './DayNavigation';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
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

  const renderWeekView = () => (
    <Container fluid className="py-4">
      <Container>
        <div className="text-center py-5">
          <h3 className="text-muted mb-3">Weekly View</h3>
          <p className="text-muted">Week view functionality coming soon...</p>
        </div>
      </Container>
    </Container>
  );

  return (
    <>
      {/* Page Header */}
      <Container fluid className="py-4">
        <Container>
          <div className="mb-4">
            <h1 className="mb-1 fw-bold">Daily Entries</h1>
            <p className="text-muted mb-0">Track your time across projects and tasks for a specific day.</p>
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