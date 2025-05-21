// src/firestore/collections/notifications.js

/**
 * Defines the structure for a Firestore document in the 'notifications' collection.
 *
 * @typedef {Object} Notification
 * @property {string} userId - The ID of the user who should receive the notification.
 * @property {string} type - The type of notification (e.g., 'task_assigned', 'event_update', 'new_message').
 * @property {string} message - The content of the notification message.
 * @property {'read' | 'unread'} status - The read status of the notification.
 * @property {firebase.firestore.Timestamp} timestamp - The timestamp when the notification was created.
 */