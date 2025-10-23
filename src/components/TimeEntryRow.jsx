import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const TimeEntryRow = ({ timeEntry, projects = [], segmentTypes = [], viewMode = 'day', onEntryUpdated, onEntryDeleted }) => {
  const { currentUserId, makeAuthenticatedRequest } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  
  // Extract initial values from timeEntry
  const [editData, setEditData] = useState({
    projectId: timeEntry.projectID ? timeEntry.projectID.toString() : '',
    segmentTypeId: timeEntry.segmentTypeID ? timeEntry.segmentTypeID.toString() : '', 
    startTime: extractTimeFromDateTime(timeEntry.startDateTime),
    endTime: extractTimeFromDateTime(timeEntry.endDateTime),
    note: timeEntry.note || ''
  });

  // Update editData when timeEntry changes
  useEffect(() => {
    setEditData({
      projectId: timeEntry.projectID ? timeEntry.projectID.toString() : '',
      segmentTypeId: timeEntry.segmentTypeID ? timeEntry.segmentTypeID.toString() : '', 
      startTime: extractTimeFromDateTime(timeEntry.startDateTime),
      endTime: extractTimeFromDateTime(timeEntry.endDateTime),
      note: timeEntry.note || ''
    });
  }, [timeEntry]);

  function extractTimeFromDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const calculateDuration = (startDateTime, endDateTime) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffInMs = end - start;
    
    if (diffInMs <= 0) return '0h 0m';
    
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error when user makes changes
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    // Reset to original values
    setEditData({
      projectId: timeEntry.projectID ? timeEntry.projectID.toString() : '',
      segmentTypeId: timeEntry.segmentTypeID ? timeEntry.segmentTypeID.toString() : '',
      startTime: extractTimeFromDateTime(timeEntry.startDateTime),
      endTime: extractTimeFromDateTime(timeEntry.endDateTime),
      note: timeEntry.note || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const validateTimes = () => {
    if (!editData.startTime || !editData.endTime) {
      return { isValid: false, message: 'Both start and end times are required' };
    }
    
    const startTime = new Date(`2025-01-01T${editData.startTime}`);
    const endTime = new Date(`2025-01-01T${editData.endTime}`);
    
    if (endTime <= startTime) {
      return { isValid: false, message: 'End time must be after start time' };
    }
    
    return { isValid: true, message: '' };
  };

  const formatLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleSave = async () => {
    const validation = validateTimes();
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create datetime objects using the original date but new times
      const originalDate = new Date(timeEntry.startDateTime);
      const year = originalDate.getFullYear();
      const month = originalDate.getMonth();
      const day = originalDate.getDate();
      
      const [startHours, startMinutes] = editData.startTime.split(':');
      const startDateTime = new Date(year, month, day, parseInt(startHours), parseInt(startMinutes), 0, 0);

      const [endHours, endMinutes] = editData.endTime.split(':');
      const endDateTime = new Date(year, month, day, parseInt(endHours), parseInt(endMinutes), 0, 0);

      const requestBody = {
        ProjectId: parseInt(editData.projectId),
        SegmentTypeId: parseInt(editData.segmentTypeId),
        StartDateTime: formatLocalDateTime(startDateTime),
        EndDateTime: formatLocalDateTime(endDateTime),
        Note: editData.note
      };

      const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_BASE_URL}/api/me/timeentries/${timeEntry.id}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsEditing(false);
      if (onEntryUpdated) {
        onEntryUpdated();
      }

    } catch (err) {
      console.error('Failed to update time entry:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_BASE_URL}/api/me/timeentries/${timeEntry.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onEntryDeleted) {
        onEntryDeleted();
      }

    } catch (err) {
      console.error('Failed to delete time entry:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <>
        <tr className="table-warning">
          <td className="ps-4">
            <Form.Select
              name="projectId"
              value={editData.projectId}
              onChange={handleInputChange}
              size="sm"
              disabled={isSubmitting}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.code}
                </option>
              ))}
            </Form.Select>
          </td>
          <td>
            <Form.Select
              name="segmentTypeId"
              value={editData.segmentTypeId}
              onChange={handleInputChange}
              size="sm"
              disabled={isSubmitting}
            >
              <option value="">Select Segment</option>
              {segmentTypes.map(segment => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </Form.Select>
          </td>
          {(viewMode === 'week' || viewMode === 'month') && (
            <td className="text-muted">
              {new Date(timeEntry.startDateTime).toLocaleDateString('en-US', 
                viewMode === 'month' 
                  ? { weekday: 'short', month: 'short', day: 'numeric' }
                  : { weekday: 'short', month: 'short', day: 'numeric' }
              )}
            </td>
          )}
          <td>
            <div className="d-flex gap-1 align-items-center">
              <Form.Control
                type="time"
                name="startTime"
                value={editData.startTime}
                onChange={handleInputChange}
                size="sm"
                disabled={isSubmitting}
                style={{ width: '90px' }}
              />
              <span className="text-muted">-</span>
              <Form.Control
                type="time"
                name="endTime"
                value={editData.endTime}
                onChange={handleInputChange}
                size="sm"
                disabled={isSubmitting}
                style={{ width: '90px' }}
              />
            </div>
          </td>
          <td className="text-muted">
            {(() => {
              if (editData.startTime && editData.endTime) {
                const today = new Date().toISOString().split('T')[0];
                const startDateTime = `${today}T${editData.startTime}:00`;
                const endDateTime = `${today}T${editData.endTime}:00`;
                return calculateDuration(startDateTime, endDateTime);
              }
              return '-';
            })()}
          </td>
          <td className="text-end pe-4">
            <div className="d-flex gap-1 justify-content-end">
              <Button
                variant="success"
                size="sm"
                onClick={handleSave}
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Save'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? <Spinner animation="border" size="sm" /> : 'Delete'}
              </Button>
            </div>
          </td>
        </tr>
        <tr className="table-warning">
          <td colSpan={(viewMode === 'week' || viewMode === 'month') ? "6" : "5"} className="ps-4 pe-4 pb-3 pt-2">
            <Form.Group>
              <Form.Label className="small text-muted mb-1">Note (optional)</Form.Label>
              <Form.Control
                as="textarea"
                name="note"
                value={editData.note}
                onChange={handleInputChange}
                placeholder="Add a note for this time entry..."
                rows={2}
                maxLength={300}
                disabled={isSubmitting}
                className="border-0 bg-light"
              />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">Maximum 300 characters</small>
                <small className="text-muted">{editData.note.length}/300</small>
              </div>
            </Form.Group>
          </td>
        </tr>
        {error && (
          <tr>
            <td colSpan={(viewMode === 'week' || viewMode === 'month') ? "6" : "5"} className="p-2">
              <div className="alert alert-danger alert-sm mb-0 py-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  // Display mode
  return (
    <>
      <tr>
        <td className="ps-4 fw-semibold">{timeEntry.projectCode}</td>
        <td className="text-muted">{timeEntry.segmentTypeName}</td>
        {(viewMode === 'week' || viewMode === 'month') && (
          <td className="text-muted">
            {new Date(timeEntry.startDateTime).toLocaleDateString('en-US', 
              viewMode === 'month' 
                ? { weekday: 'short', month: 'short', day: 'numeric' }
                : { weekday: 'short', month: 'short', day: 'numeric' }
            )}
          </td>
        )}
        <td className="text-muted">
          {new Date(timeEntry.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(timeEntry.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="text-muted">
          {calculateDuration(timeEntry.startDateTime, timeEntry.endDateTime)}
        </td>
        <td className="text-end pe-4">
          <div className="d-flex gap-2 justify-content-end align-items-center">
            {timeEntry.note && (
              <Button
                variant="link"
                className="text-muted p-0"
                onClick={() => setShowNotes(!showNotes)}
                title={showNotes ? 'Hide note' : 'Show note'}
                style={{ fontSize: '14px' }}
              >
                <i className={`bi bi-chat-text${showNotes ? '-fill' : ''}`}></i>
              </Button>
            )}
            <Button
              variant="link"
              className="fw-semibold text-primary text-decoration-none p-0"
              onClick={handleEdit}
            >
              Edit
            </Button>
          </div>
        </td>
      </tr>
      {(showNotes && timeEntry.note) && (
        <tr className="table-light">
          <td colSpan={(viewMode === 'week' || viewMode === 'month') ? "6" : "5"} className="ps-4 pe-4 pb-2 pt-1">
            <div className="d-flex align-items-start">
              <small className="text-muted me-2 mt-1">
                <i className="bi bi-chat-text"></i>
              </small>
              <small className="text-muted">
                <strong>Note:</strong> {timeEntry.note}
              </small>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TimeEntryRow;