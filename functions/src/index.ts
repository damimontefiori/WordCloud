import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { createRoom } from './rooms/createRoom';
export { joinRoom } from './rooms/joinRoom';
export { activateRoom } from './rooms/activateRoom';
export { submitWord } from './words/submitWord';
export { cleanupExpiredRooms, manualCleanup } from './cleanup/cleanupExpiredRooms';

// Test function for development
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
    message: 'WordCloud Functions are working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
