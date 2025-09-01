import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';

// Initialize Firebase Functions with emulator
const functions = getFunctions(app);
if (import.meta.env.DEV) {
  functions.host = 'localhost';
  functions.port = 5001;
}

export const activateRoom = httpsCallable(functions, 'activateRoom');

// Helper function to activate a room
export const activateRoomHelper = async (roomCode) => {
  try {
    const auth = getAuth(app);
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    const result = await activateRoom({ roomCode });
    return result.data;
  } catch (error) {
    console.error('Error activating room:', error);
    throw error;
  }
};
