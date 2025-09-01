import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS, ROOM_STATES } from '../utils/constants';

const db = admin.firestore();

interface ActivateRoomRequest {
  roomCode: string;
}

export const activateRoom = functions.https.onCall(async (data: ActivateRoomRequest, context) => {
  try {
    // Get user from context
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { roomCode } = data;

    if (!roomCode) {
      throw new functions.https.HttpsError('invalid-argument', 'Room code is required');
    }

    // Find room by code
    const roomQuery = await db.collection(COLLECTIONS.ROOMS)
      .where('code', '==', roomCode.toUpperCase())
      .limit(1)
      .get();

    if (roomQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Room not found');
    }

    const roomDoc = roomQuery.docs[0];
    const roomData = roomDoc.data();

    // Check if user is the room creator
    if (roomData.createdBy !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only room creator can activate the room');
    }

    // Activate the room
    await roomDoc.ref.update({
      state: ROOM_STATES.ACTIVE,
      isActive: true,
      activatedAt: admin.firestore.Timestamp.now()
    });

    return {
      success: true,
      message: 'Room activated successfully'
    };

  } catch (error: any) {
    console.error('Error activating room:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Internal server error');
  }
});
