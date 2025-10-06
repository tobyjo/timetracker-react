import React from 'react';
import { Container } from 'react-bootstrap';

const TimeEntryForm = () => {
  return (
    <Container fluid className="py-4">
      <Container>
        <h1 className="mb-4">TimeEntryForm</h1>
        <p>This is the Dashboard page where time entries will be managed.</p>
      </Container>
    </Container>
  );
};

export default TimeEntryForm;