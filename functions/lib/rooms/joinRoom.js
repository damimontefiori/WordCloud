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
exports.joinRoom = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
const db = admin.firestore();
exports.joinRoom = functions.https.onCall(async (data, context) => {
    try {
        const { roomCode, participantName = '', sessionId } = data;
        if (!roomCode || !sessionId) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'Código de sala y ID de sesión son requeridos');
        }
        // Find room by code
        const roomQuery = await db.collection(constants_1.COLLECTIONS.ROOMS)
            .where('code', '==', roomCode.toUpperCase())
            .limit(1)
            .get();
        if (roomQuery.empty) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_NOT_FOUND, 'Sala no encontrada');
        }
        const roomDoc = roomQuery.docs[0];
        const roomData = roomDoc.data();
        // Check if room is expired
        if (roomData.expiresAt.toDate() < new Date()) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_EXPIRED, 'La sala ha expirado');
        }
        // Check if room is finished
        if (roomData.isFinished || roomData.state === constants_1.ROOM_STATES.FINISHED) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_FINISHED, 'La sala ha finalizado');
        }
        // Check participant limit
        if (roomData.participantCount >= constants_1.MAX_PARTICIPANTS_PER_ROOM) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.ROOM_FULL, 'La sala está llena');
        }
        // Check if participant already exists (by sessionId)
        const existingParticipant = await db.collection(constants_1.COLLECTIONS.PARTICIPANTS)
            .where('roomId', '==', roomDoc.id)
            .where('sessionId', '==', sessionId)
            .limit(1)
            .get();
        if (!existingParticipant.empty) {
            const participantData = existingParticipant.docs[0].data();
            return (0, helpers_1.createSuccessResponse)({
                participantId: existingParticipant.docs[0].id,
                participantName: participantData.name,
                roomTitle: roomData.title,
                roomState: roomData.state,
                hasVoted: participantData.hasVoted,
                isActive: roomData.isActive,
                requiresConfirmation: roomData.requiresConfirmation
            });
        }
        // Get existing participant names to ensure uniqueness
        const existingParticipants = await db.collection(constants_1.COLLECTIONS.PARTICIPANTS)
            .where('roomId', '==', roomDoc.id)
            .get();
        const existingNames = existingParticipants.docs.map(doc => doc.data().name);
        // Generate unique participant name
        const uniqueName = (0, helpers_1.generateUniqueParticipantName)(participantName, existingNames);
        // Create participant document
        const now = firestore_1.Timestamp.now();
        const participantData = {
            roomId: roomDoc.id,
            name: uniqueName,
            originalName: participantName.trim() || 'Invitado',
            sessionId,
            hasVoted: false,
            joinedAt: now,
            lastSeen: now,
            isActive: true
        };
        const participantRef = await db.collection(constants_1.COLLECTIONS.PARTICIPANTS).add(participantData);
        // Update room participant count
        await roomDoc.ref.update({
            participantCount: firestore_1.FieldValue.increment(1)
        });
        return (0, helpers_1.createSuccessResponse)({
            participantId: participantRef.id,
            participantName: uniqueName,
            roomTitle: roomData.title,
            roomState: roomData.state,
            hasVoted: false,
            isActive: roomData.isActive,
            requiresConfirmation: roomData.requiresConfirmation,
            timeLimit: roomData.timeLimit,
            startedAt: roomData.startedAt
        });
    }
    catch (error) {
        console.error('Error joining room:', error);
        return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'Error interno del servidor');
    }
});
//# sourceMappingURL=joinRoom.js.map