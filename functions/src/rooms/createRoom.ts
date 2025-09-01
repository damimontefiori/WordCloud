import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { generateRoomCode, validateRoomTitle, createErrorResponse, createSuccessResponse } from '../utils/helpers';
import { COLLECTIONS, ROOM_STATES, ERROR_CODES, ROOM_EXPIRY_DAYS, MAX_TIME_LIMIT_MINUTES } from '../utils/constants';

const db = admin.firestore();

interface CreateRoomRequest {
  title: string;
  requiresConfirmation?: boolean;
  timeLimit?: number; // in minutes
}

export const createRoom = functions.https.onCall(async (data: CreateRoomRequest, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      return createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Usuario no autenticado');
    }

    const { title, requiresConfirmation = false, timeLimit } = data;

    // Validate input
    const titleValidation = validateRoomTitle(title);
    if (!titleValidation.isValid) {
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, titleValidation.error!);
    }

    // Validate time limit if provided
    if (timeLimit !== undefined) {
      if (typeof timeLimit !== 'number' || timeLimit <= 0 || timeLimit > MAX_TIME_LIMIT_MINUTES) {
        return createErrorResponse(
          ERROR_CODES.INVALID_INPUT, 
          `El tiempo límite debe estar entre 1 y ${MAX_TIME_LIMIT_MINUTES} minutos`
        );
      }
    }

    // Generate unique room code
    let roomCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      roomCode = generateRoomCode();
      const existingRoom = await db.collection(COLLECTIONS.ROOMS)
        .where('code', '==', roomCode)
        .limit(1)
        .get();
      
      isUnique = existingRoom.empty;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'No se pudo generar un código único');
    }

    // Create room document
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + ROOM_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    );

    const roomData = {
      title: title.trim(),
      code: roomCode!,
      createdBy: context.auth.uid,
      createdAt: now,
      expiresAt,
      isActive: false,
      isFinished: false,
      state: ROOM_STATES.WAITING,
      requiresConfirmation,
      timeLimit: timeLimit || null,
      startedAt: null,
      finishedAt: null,
      participantCount: 0,
      wordCount: 0
    };

    const roomRef = await db.collection(COLLECTIONS.ROOMS).add(roomData);

    // Create user document if it doesn't exist
    const userRef = db.collection(COLLECTIONS.USERS).doc(context.auth.uid);
    await userRef.set({
      email: context.auth.token.email,
      lastLogin: now,
      roomsCreated: FieldValue.increment(1)
    }, { merge: true });

    return createSuccessResponse({
      roomId: roomRef.id,
      roomCode: roomCode!,
      title: title.trim(),
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/room/${roomCode}`
    });

  } catch (error) {
    console.error('Error creating room:', error);
    return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Error interno del servidor');
  }
});
