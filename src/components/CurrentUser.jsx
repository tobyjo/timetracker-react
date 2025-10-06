import React from 'react';
import { Container } from 'react-bootstrap';

const CurrentUser = () => {
  return (
    <Container fluid className="py-4">
      <Container>
        <h1 className="mb-4">CurrentUser</h1>
        <p>This is the User Profile page where user information will be displayed.</p>
      </Container>
    </Container>
  );
};

export default CurrentUser;