import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

// Firebase Functions
export const createRoomFunction = httpsCallable(functions, 'createRoom');
export const joinRoomFunction = httpsCallable(functions, 'joinRoom');
export const submitWordFunction = httpsCallable(functions, 'submitWord');
export const manualCleanupFunction = httpsCallable(functions, 'manualCleanup');

// API wrapper functions
export const apiService = {
  // Create a new room
  async createRoom(data) {
    try {
      const result = await createRoomFunction(data);
      return result.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error(error.message || 'Error al crear la sala');
    }
  },

  // Join an existing room
  async joinRoom(data) {
    try {
      const result = await joinRoomFunction(data);
      return result.data;
    } catch (error) {
      console.error('Error joining room:', error);
      throw new Error(error.message || 'Error al unirse a la sala');
    }
  },

  // Submit a word
  async submitWord(data) {
    try {
      const result = await submitWordFunction(data);
      return result.data;
    } catch (error) {
      console.error('Error submitting word:', error);
      throw new Error(error.message || 'Error al enviar la palabra');
    }
  },

  // Manual cleanup (admin only)
  async manualCleanup() {
    try {
      const result = await manualCleanupFunction();
      return result.data;
    } catch (error) {
      console.error('Error in manual cleanup:', error);
      throw new Error(error.message || 'Error en la limpieza manual');
    }
  }
};
