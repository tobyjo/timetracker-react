import React from 'react';
import { Container } from 'react-bootstrap';

const Settings = () => {
  return (
    <Container fluid className="py-4">
      <Container>
        <h1 className="mb-4">Settings</h1>
        <p>This is the Settings page where application preferences will be configured.</p>
      </Container>
    </Container>
  );
};

export default Settings;