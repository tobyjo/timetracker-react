import { useEffect, useState } from "react";
import { Alert, Spinner, Button, Card, Container } from "react-bootstrap";
import TimeEntryRow from "./TimeEntryRow.jsx";
import { useUser } from "../contexts/UserContext";
/*
  Requirements:
  - Ensure Bootstrap CSS is loaded globally, e.g. in main.jsx:
    import "bootstrap/dist/css/bootstrap.min.css";
    import "./time-entry-dashboard.css"; // optional for custom styles below
*/

/*
GET https://localhost:7201/api/user/1/timeentries
*/

/*
const userWithTimeEntries = {
  "id": 1,
  "userName": "kirstine",
  "fullName": "Kirstine Hall",
  "timeEntries": [
    {
      "id": 1,
      "startDateTime": "2025-08-01T09:00:00",
      "endDateTime": "2025-08-01T17:00:00",
      "projectCode": "BPC.001",
      "userID": 1,
      "projectDescription": "Berkshire Primary Care 001",
      "segmentTypeName": "Meeting"
    },
    {
      "id": 2,
      "startDateTime": "2025-08-02T09:00:00",
      "endDateTime": "2025-08-02T13:00:00",
      "projectCode": "BPC.001",
      "userID": 1,
      "projectDescription": "Berkshire Primary Care 001",
      "segmentTypeName": "Calls"
    },
    {
      "id": 3,
      "startDateTime": "2025-08-02T13:00:00",
      "endDateTime": "2025-08-02T15:00:00",
      "projectCode": "BP",
      "userID": 1,
      "projectDescription": "ARRS",
      "segmentTypeName": "Planning"
    },
    {
      "id": 4,
      "startDateTime": "2025-10-01T09:00:00",
      "endDateTime": "2025-10-01T17:00:00",
      "projectCode": "BPC.001",
      "userID": 1,
      "projectDescription": "Berkshire Primary Care 001",
      "segmentTypeName": "Meeting"
    }
  ]
};
*/

const TimeEntriesList = ({ selectedDate }) => {
  const { currentUserId } = useUser();
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [segmentTypes, setSegmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserWithTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create start and end datetime for the selected date
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(0, 0, 0, 0); // Start of day
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day
      
      // Format dates for API (ISO string format)
      const startParam = startDateTime.toISOString();
      const endParam = endDateTime.toISOString();
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/timeentries?startDateTime=${encodeURIComponent(startParam)}&endDateTime=${encodeURIComponent(endParam)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userWithTimeEntries = await response.json();      
      setTimeEntries(userWithTimeEntries.timeEntries || []);
    } catch (err) {
      console.error('Failed to fetch time entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userWithProjects = await response.json();
      setProjects(userWithProjects.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchSegmentTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${currentUserId}/segmenttypes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userWithSegmentTypes = await response.json();
      setSegmentTypes(userWithSegmentTypes.segmentTypes || []);
    } catch (err) {
      console.error('Failed to fetch segment types:', err);
    }
  };

  const handleEntryUpdated = () => {
    fetchUserWithTimeEntries(); // Refresh the list
  };

  const handleEntryDeleted = () => {
    fetchUserWithTimeEntries(); // Refresh the list
  };

  const calculateTotalDuration = (entries) => {
    if (!entries || entries.length === 0) return '0h 0m';
    
    let totalMinutes = 0;
    
    entries.forEach(entry => {
      const start = new Date(entry.startDateTime);
      const end = new Date(entry.endDateTime);
      const diffInMs = end - start;
      
      if (diffInMs > 0) {
        totalMinutes += Math.floor(diffInMs / (1000 * 60));
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  useEffect(() => {
    if (currentUserId && selectedDate) {
      fetchUserWithTimeEntries();
      fetchProjects();
      fetchSegmentTypes();
    }
  }, [currentUserId, selectedDate]);

  // Show loading spinner
  if (loading) {
    return (
      <Container fluid className="py-4">
        <Container>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading time entries...</p>
            </div>
          </div>
        </Container>
      </Container>
    );
  }

  // Show error message
  if (error) {
    return (
      <Container fluid className="py-4">
        <Container>
          <Card className="border-0 shadow-sm mb-4">            
            <Card.Body className="p-4">
              <Alert variant="danger" className="mb-4">
                <Alert.Heading className="d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Unable to Load Time Entries
                </Alert.Heading>
                <p className="mb-3">
                  There was a problem connecting to the server. Please check that the API is running and try again.
                </p>
                <p className="text-muted small mb-3">
                  <strong>Error:</strong> {error}
                </p>
                <hr />
                <div className="d-flex gap-2 mb-0">
                  <Button variant="outline-danger" onClick={fetchUserWithTimeEntries}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </Button>
                  <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Refresh Page
                  </Button>
                </div>
              </Alert>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    );
  }

  return (
    <Container fluid className="py-1">
      <Container>
        {timeEntries.length === 0 ? (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <Alert variant="info" className="text-center mb-0">
                <i className="bi bi-info-circle me-2"></i>
                No time entries found for the selected date.
              </Alert>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm mb-4">
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4 text-start">Project</th>
                    <th scope="col">Segment</th>
                    <th scope="col">Time</th>
                    <th scope="col">Duration</th>
                    <th scope="col" className="text-end pe-4">
                      <span className="visually-hidden">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map(e => (
                    <TimeEntryRow 
                      key={e.id} 
                      timeEntry={e}
                      projects={projects}
                      segmentTypes={segmentTypes}
                      onEntryUpdated={handleEntryUpdated}
                      onEntryDeleted={handleEntryDeleted}
                    />
                  ))}
                  {timeEntries.length > 0 && (
                    <tr className="border-top border-2">
                      <td colSpan="3" className="text-end fw-bold text-muted ps-4">
                        Total Duration:
                      </td>
                      <td className="fw-bold text-primary">
                        {calculateTotalDuration(timeEntries)}
                      </td>
                      <td className="pe-4"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Container>
    </Container>
  );
}

export default TimeEntriesList;