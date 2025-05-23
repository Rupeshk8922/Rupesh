import { db } from '@/firebase'; // Firestore instance
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

/**
 * Logs volunteer hours for a specific event.
 * @param {Object} params
 * @param {string} params.volunteerId - Firebase Auth user ID of the volunteer.
 * @param {string} params.eventId - ID of the event.
 * @param {number} params.hours - Number of hours to log (non-negative).
 * @param {string|null} [params.approvedBy=null] - Admin user ID who approved the hours, or null.
 * @returns {Promise<{success: boolean, id?: string, error?: any}>}
 */
export async function logVolunteerHours({ volunteerId, eventId, hours, approvedBy = null }) {
  if (
    typeof volunteerId !== 'string' ||
    typeof eventId !== 'string' ||
    typeof hours !== 'number' ||
    hours < 0
  ) {
    return { success: false, error: new Error('Invalid input data for volunteer hours.') };
  }

  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'volunteer_hours'), {
      volunteerId,
      eventId,
      hours,
      date: now,
      approvedBy,
      createdAt: now,
      updatedAt: now,
    });
    console.log('Volunteer hours logged with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error logging volunteer hours:', error);
    return { success: false, error };
  }
}

/**
 * Gets total volunteer hours logged by a specific volunteer across all events.
 * @param {string} volunteerId - Firebase Auth user ID of the volunteer.
 * @returns {Promise<number>} Total hours.
 */
export async function getTotalVolunteerHours(volunteerId) {
  if (typeof volunteerId !== 'string') {
    throw new Error('volunteerId must be a string');
  }

  const q = query(collection(db, 'volunteer_hours'), where('volunteerId', '==', volunteerId));
  const snapshot = await getDocs(q);

  let totalHours = 0;
  snapshot.forEach((doc) => {
    totalHours += doc.data().hours || 0;
  });

  return totalHours;
}

/**
 * Gets total volunteer hours grouped by event for a specific volunteer.
 * @param {string} volunteerId - Firebase Auth user ID.
 * @returns {Promise<Array<{name: string, hours: number}>>} Array of objects with event names and total hours.
 */
export async function getTotalHoursByEvent(volunteerId) {
  if (typeof volunteerId !== 'string') {
    throw new Error('volunteerId must be a string');
  }

  const q = query(collection(db, 'volunteer_hours'), where('volunteerId', '==', volunteerId));
  const snapshot = await getDocs(q);

  const hoursByEvent = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const eventId = data.eventId;
    const hours = data.hours || 0;

    hoursByEvent[eventId] = (hoursByEvent[eventId] || 0) + hours;
  });

  // TODO: Query 'events' collection to replace eventId with event name if needed
  return Object.entries(hoursByEvent).map(([eventId, hours]) => ({
    name: `Event ${eventId}`,
    hours,
  }));
}

/**
 * Gets monthly aggregated volunteer hours for a specific volunteer.
 * @param {string} volunteerId - Firebase Auth user ID.
 * @returns {Promise<Array<{name: string, hours: number}>>} Array of monthly hours sorted chronologically.
 */
export async function getMonthlyVolunteerHours(volunteerId) {
  if (typeof volunteerId !== 'string') {
    throw new Error('volunteerId must be a string');
  }

  const q = query(
    collection(db, 'volunteer_hours'),
    where('volunteerId', '==', volunteerId),
    orderBy('date')
  );
  const snapshot = await getDocs(q);

  const monthlyHours = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate();
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const hours = data.hours || 0;

    monthlyHours[monthYear] = (monthlyHours[monthYear] || 0) + hours;
  });

  return Object.entries(monthlyHours)
    .map(([monthYear, hours]) => ({ name: monthYear, hours }))
    .sort((a, b) => (a.name > b.name ? 1 : -1));
}
