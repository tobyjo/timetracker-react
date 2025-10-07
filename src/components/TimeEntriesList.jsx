import { useEffect, useState } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
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
        `https://localhost:7201/api/user/${currentUserId}/timeentries?startDateTime=${encodeURIComponent(startParam)}&endDateTime=${encodeURIComponent(endParam)}`
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

  useEffect(() => {
    if (currentUserId && selectedDate) {
      fetchUserWithTimeEntries();
    }
  }, [currentUserId, selectedDate]);


  // Show loading spinner
  if (loading) {
    return (
      <main className="container-xl py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading time entries...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show error message
  if (error) {
    return (
      <main className="container-xl py-4">
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
      </main>
    );
  }

  return (
    <main className="container-xl py-0 pb-4">
      <div className="mb-4">
        <h2 className="display-6 fw-bold mb-0">Time Entries</h2>
      </div>
      
      {timeEntries.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No time entries found for the selected date.
        </Alert>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered rounded-3 overflow-hidden mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" className="ps-4 text-start">Project</th>
                <th scope="col">Segment</th>
                <th scope="col">Time</th>
                <th scope="col" className="text-end pe-4">
                  <span className="visually-hidden">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.map(e => (
                <TimeEntryRow key={e.id} timeEntry={e} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default TimeEntriesList;