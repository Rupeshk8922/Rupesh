import React from 'react';

const volunteerAnalytics = () => {
  return <div>volunteerAnalytics Placeholder</div>;
};

export const getVolunteerEventCount = (volunteer) => {
  return volunteer.events ? volunteer.events.length : 0;
};
export default volunteerAnalytics;
