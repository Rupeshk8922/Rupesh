js
// src/utils/volunteerAnalytics.js

/**
 * Calculates the number of events assigned to a volunteer.
 * @param {object} volunteer - The volunteer object.
 * @param {string[]} [volunteer.assignedEvents] - An array of event IDs assigned to the volunteer.
 * @returns {number} The number of assigned events.
 */
export const getVolunteerEventCount = (volunteer) => {
  if (volunteer && Array.isArray(volunteer.assignedEvents)) {
    return volunteer.assignedEvents.length;
  }
  return 0; // Return 0 if assignedEvents is missing or not an array
};