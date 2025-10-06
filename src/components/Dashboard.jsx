import React from 'react';
import TimeEntryForm from './TimeEntryForm';
import TimeEntriesList from './TimeEntriesList';

const Dashboard = () => {
  return (
    <>
      <TimeEntryForm />
      <TimeEntriesList />
    </>
  );
};

export default Dashboard;