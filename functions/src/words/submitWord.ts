import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { validateWord, createErrorResponse, createSuccessResponse } from '../utils/helpers';
import { COLLECTIONS, ROOM_STATES, ERROR_CODES } from '../utils/constants';

const db = admin.firestore();

interface SubmitWordRequest {
  participantId: string;
  word: string;
}

export const submitWord = functions.https.onCall(async (data: SubmitWordRequest, context) => {
  try {
    functions.logger.info('submitWord llamado con datos:', { data, contextAuth: context.auth });
    
    const { participantId, word } = data;

    functions.logger.info('participantId extraído:', participantId);
    functions.logger.info('word extraído:', word);

    if (!participantId || !word) {
      functions.logger.error('Faltan datos requeridos:', { participantId, word });
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de participante y palabra son requeridos');
    }

    // Validate word
    const wordValidation = validateWord(word);
    if (!wordValidation.isValid) {
      return createErrorResponse(ERROR_CODES.INVALID_WORD, wordValidation.error!);
    }

    // Get participant
    functions.logger.info('Buscando participante con ID:', participantId);
    const participantDoc = await db.collection(COLLECTIONS.PARTICIPANTS).doc(participantId).get();
    
    functions.logger.info('Resultado de participantDoc.exists:', participantDoc.exists);
    
    if (!participantDoc.exists) {
      functions.logger.error('Participante no encontrado:', participantId);
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Participante no encontrado');
    }

    const participantData = participantDoc.data()!;
    functions.logger.info('Datos del participante:', participantData);

    // Check if participant has already voted
    if (participantData.hasVoted) {
      return createErrorResponse(ERROR_CODES.ALREADY_VOTED, 'Ya has enviado tu palabra');
    }

    // Get room
    const roomDoc = await db.collection(COLLECTIONS.ROOMS).doc(participantData.roomId).get();
    
    if (!roomDoc.exists) {
      return createErrorResponse(ERROR_CODES.ROOM_NOT_FOUND, 'Sala no encontrada');
    }

    const roomData = roomDoc.data()!;

    // Check room state
    if (roomData.isFinished || roomData.state === ROOM_STATES.FINISHED) {
      return createErrorResponse(ERROR_CODES.ROOM_FINISHED, 'La sala ha finalizado');
    }

    if (roomData.expiresAt.toDate() < new Date()) {
      return createErrorResponse(ERROR_CODES.ROOM_EXPIRED, 'La sala ha expirado');
    }

    // Check if room requires confirmation and is not active
    if (roomData.requiresConfirmation && !roomData.isActive) {
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'La votación no ha comenzado');
    }

    const cleanWord = wordValidation.word!.toLowerCase();

    // Use transaction to ensure consistency
    await db.runTransaction(async (transaction) => {
      // Check if word already exists for this room
      const wordQuery = await transaction.get(
        db.collection(COLLECTIONS.WORDS)
          .where('roomId', '==', participantData.roomId)
          .where('text', '==', cleanWord)
          .limit(1)
      );

      let wordRef;
      
      if (!wordQuery.empty) {
        // Word exists, increment count
        wordRef = wordQuery.docs[0].ref;
        const wordData = wordQuery.docs[0].data();
        
        transaction.update(wordRef, {
          count: FieldValue.increment(1),
          submittedBy: FieldValue.arrayUnion(participantId),
          updatedAt: Timestamp.now()
        });
      } else {
        // Create new word
        wordRef = db.collection(COLLECTIONS.WORDS).doc();
        transaction.set(wordRef, {
          roomId: participantData.roomId,
          text: cleanWord,
          originalText: wordValidation.word!,
          count: 1,
          submittedBy: [participantId],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      // Mark participant as voted
      transaction.update(participantDoc.ref, {
        hasVoted: true,
        votedAt: Timestamp.now(),
        submittedWord: cleanWord
      });

      // Update room word count
      transaction.update(roomDoc.ref, {
        wordCount: FieldValue.increment(1),
        lastActivity: Timestamp.now()
      });
    });

    // Check if all participants have voted (for auto-finish)
    const allParticipants = await db.collection(COLLECTIONS.PARTICIPANTS)
      .where('roomId', '==', participantData.roomId)
      .where('isActive', '==', true)
      .get();

    const votedParticipants = allParticipants.docs.filter(doc => doc.data().hasVoted);

    // Auto-finish if all participants have voted
    if (votedParticipants.length === allParticipants.size && allParticipants.size > 0) {
      await roomDoc.ref.update({
        isFinished: true,
        state: ROOM_STATES.FINISHED,
        finishedAt: Timestamp.now(),
        finishReason: 'all_voted'
      });
    }

    return createSuccessResponse({
      word: wordValidation.word!,
      participantName: participantData.name,
      allVoted: votedParticipants.length === allParticipants.size
    });

  } catch (error) {
    console.error('Error submitting word:', error);
    return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Error interno del servidor');
  }
});
