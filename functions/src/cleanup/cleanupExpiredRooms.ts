import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS, ROOM_STATES } from '../utils/constants';

const db = admin.firestore();

export const cleanupExpiredRooms = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      
      console.log('Starting cleanup of expired rooms...');

      // Find expired rooms
      const expiredRoomsQuery = await db.collection(COLLECTIONS.ROOMS)
        .where('expiresAt', '<=', now)
        .limit(50) // Process in batches
        .get();

      if (expiredRoomsQuery.empty) {
        console.log('No expired rooms found');
        return null;
      }

      console.log(`Found ${expiredRoomsQuery.size} expired rooms`);

      // Process each expired room
      const batch = db.batch();
      const roomIds: string[] = [];

      for (const roomDoc of expiredRoomsQuery.docs) {
        const roomId = roomDoc.id;
        roomIds.push(roomId);

        // Update room state to expired
        batch.update(roomDoc.ref, {
          state: ROOM_STATES.EXPIRED,
          isFinished: true,
          finishedAt: now,
          finishReason: 'expired'
        });
      }

      // Commit room updates
      await batch.commit();

      // Clean up related data for each room
      for (const roomId of roomIds) {
        await cleanupRoomData(roomId);
      }

      console.log(`Successfully cleaned up ${roomIds.length} expired rooms`);
      return null;

    } catch (error) {
      console.error('Error in cleanup function:', error);
      throw error;
    }
  });

/**
 * Clean up all data related to a specific room
 */
async function cleanupRoomData(roomId: string): Promise<void> {
  try {
    // Delete participants
    const participantsQuery = await db.collection(COLLECTIONS.PARTICIPANTS)
      .where('roomId', '==', roomId)
      .get();

    if (!participantsQuery.empty) {
      const participantsBatch = db.batch();
      participantsQuery.docs.forEach(doc => {
        participantsBatch.delete(doc.ref);
      });
      await participantsBatch.commit();
      console.log(`Deleted ${participantsQuery.size} participants for room ${roomId}`);
    }

    // Delete words
    const wordsQuery = await db.collection(COLLECTIONS.WORDS)
      .where('roomId', '==', roomId)
      .get();

    if (!wordsQuery.empty) {
      const wordsBatch = db.batch();
      wordsQuery.docs.forEach(doc => {
        wordsBatch.delete(doc.ref);
      });
      await wordsBatch.commit();
      console.log(`Deleted ${wordsQuery.size} words for room ${roomId}`);
    }

    // Finally delete the room (keep for audit trail for now)
    // await db.collection(COLLECTIONS.ROOMS).doc(roomId).delete();
    
  } catch (error) {
    console.error(`Error cleaning up room ${roomId}:`, error);
    throw error;
  }
}

/**
 * Manual cleanup function for immediate execution
 */
export const manualCleanup = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const now = admin.firestore.Timestamp.now();
    
    // Find expired rooms
    const expiredRoomsQuery = await db.collection(COLLECTIONS.ROOMS)
      .where('expiresAt', '<=', now)
      .get();

    const roomIds: string[] = [];
    const batch = db.batch();

    for (const roomDoc of expiredRoomsQuery.docs) {
      const roomId = roomDoc.id;
      roomIds.push(roomId);

      batch.update(roomDoc.ref, {
        state: ROOM_STATES.EXPIRED,
        isFinished: true,
        finishedAt: now,
        finishReason: 'manual_cleanup'
      });
    }

    await batch.commit();

    // Clean up related data
    for (const roomId of roomIds) {
      await cleanupRoomData(roomId);
    }

    return {
      success: true,
      message: `Cleaned up ${roomIds.length} expired rooms`,
      roomIds
    };

  } catch (error) {
    console.error('Error in manual cleanup:', error);
    throw new functions.https.HttpsError('internal', 'Error interno del servidor');
  }
});
