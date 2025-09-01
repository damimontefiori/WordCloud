"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitWord = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
const db = admin.firestore();
exports.submitWord = functions.https.onCall(async (data, context) => {
    try {
        functions.logger.info('submitWord llamado con datos:', { data, contextAuth: context.auth });
        const { participantId, word } = data;
        functions.logger.info('participantId extraído:', participantId);
        functions.logger.info('word extraído:', word);
        if (!participantId || !word) {
            functions.logger.error('Faltan datos requeridos:', { participantId, word });
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'ID de participante y palabra son requeridos');
        }
        // Validate word
        const wordValidation = (0, helpers_1.validateWord)(word);
        if (!wordValidation.isValid) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_WORD, wordValidation.error);
        }
        // Get participant
        functions.logger.info('Buscando participante con ID:', participantId);
        const participantDoc = await db.collection(constants_1.COLLECTIONS.PARTICIPANTS).doc(participantId).get();
        functions.logger.info('Resultado de participantDoc.exists:', participantDoc.exists);
        if (!participantDoc.exists) {
            functions.logger.error('Participante no encontrado:', participantId);
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'Participante no encontrado');
        }
        const participantData = participantDoc.data();
        functions.logger.info('Datos del participante:', participantData);
        // Check if participant has already voted
        if (participantData.hasVoted) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ALREADY_VOTED, 'Ya has enviado tu palabra');
        }
        // Get room
        const roomDoc = await db.collection(constants_1.COLLECTIONS.ROOMS).doc(participantData.roomId).get();
        if (!roomDoc.exists) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_NOT_FOUND, 'Sala no encontrada');
        }
        const roomData = roomDoc.data();
        // Check room state
        if (roomData.isFinished || roomData.state === constants_1.ROOM_STATES.FINISHED) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_FINISHED, 'La sala ha finalizado');
        }
        if (roomData.expiresAt.toDate() < new Date()) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_EXPIRED, 'La sala ha expirado');
        }
        // Check if room requires confirmation and is not active
        if (roomData.requiresConfirmation && !roomData.isActive) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'La votación no ha comenzado');
        }
        const cleanWord = wordValidation.word.toLowerCase();
        // Use transaction to ensure consistency
        await db.runTransaction(async (transaction) => {
            // Check if word already exists for this room
            const wordQuery = await transaction.get(db.collection(constants_1.COLLECTIONS.WORDS)
                .where('roomId', '==', participantData.roomId)
                .where('text', '==', cleanWord)
                .limit(1));
            let wordRef;
            if (!wordQuery.empty) {
                // Word exists, increment count
                wordRef = wordQuery.docs[0].ref;
                const wordData = wordQuery.docs[0].data();
                transaction.update(wordRef, {
                    count: firestore_1.FieldValue.increment(1),
                    submittedBy: firestore_1.FieldValue.arrayUnion(participantId),
                    updatedAt: firestore_1.Timestamp.now()
                });
            }
            else {
                // Create new word
                wordRef = db.collection(constants_1.COLLECTIONS.WORDS).doc();
                transaction.set(wordRef, {
                    roomId: participantData.roomId,
                    text: cleanWord,
                    originalText: wordValidation.word,
                    count: 1,
                    submittedBy: [participantId],
                    createdAt: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now()
                });
            }
            // Mark participant as voted
            transaction.update(participantDoc.ref, {
                hasVoted: true,
                votedAt: firestore_1.Timestamp.now(),
                submittedWord: cleanWord
            });
            // Update room word count
            transaction.update(roomDoc.ref, {
                wordCount: firestore_1.FieldValue.increment(1),
                lastActivity: firestore_1.Timestamp.now()
            });
        });
        // Check if all participants have voted (for auto-finish)
        const allParticipants = await db.collection(constants_1.COLLECTIONS.PARTICIPANTS)
            .where('roomId', '==', participantData.roomId)
            .where('isActive', '==', true)
            .get();
        const votedParticipants = allParticipants.docs.filter(doc => doc.data().hasVoted);
        // Auto-finish if all participants have voted
        if (votedParticipants.length === allParticipants.size && allParticipants.size > 0) {
            await roomDoc.ref.update({
                isFinished: true,
                state: constants_1.ROOM_STATES.FINISHED,
                finishedAt: firestore_1.Timestamp.now(),
                finishReason: 'all_voted'
            });
        }
        return (0, helpers_1.createSuccessResponse)({
            word: wordValidation.word,
            participantName: participantData.name,
            allVoted: votedParticipants.length === allParticipants.size
        });
    }
    catch (error) {
        console.error('Error submitting word:', error);
        return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'Error interno del servidor');
    }
});
//# sourceMappingURL=submitWord.js.map