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
exports.createRoom = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
const db = admin.firestore();
exports.createRoom = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.UNAUTHORIZED, 'Usuario no autenticado');
        }
        const { title, requiresConfirmation = false, timeLimit } = data;
        // Validate input
        const titleValidation = (0, helpers_1.validateRoomTitle)(title);
        if (!titleValidation.isValid) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, titleValidation.error);
        }
        // Validate time limit if provided
        if (timeLimit !== undefined) {
            if (typeof timeLimit !== 'number' || timeLimit <= 0 || timeLimit > constants_1.MAX_TIME_LIMIT_MINUTES) {
                return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, `El tiempo límite debe estar entre 1 y ${constants_1.MAX_TIME_LIMIT_MINUTES} minutos`);
            }
        }
        // Generate unique room code
        let roomCode;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;
        do {
            roomCode = (0, helpers_1.generateRoomCode)();
            const existingRoom = await db.collection(constants_1.COLLECTIONS.ROOMS)
                .where('code', '==', roomCode)
                .limit(1)
                .get();
            isUnique = existingRoom.empty;
            attempts++;
        } while (!isUnique && attempts < maxAttempts);
        if (!isUnique) {
            return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'No se pudo generar un código único');
        }
        // Create room document
        const now = firestore_1.Timestamp.now();
        const expiresAt = firestore_1.Timestamp.fromDate(new Date(Date.now() + constants_1.ROOM_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const roomData = {
            title: title.trim(),
            code: roomCode,
            createdBy: context.auth.uid,
            createdAt: now,
            expiresAt,
            isActive: false,
            isFinished: false,
            state: constants_1.ROOM_STATES.WAITING,
            requiresConfirmation,
            timeLimit: timeLimit || null,
            startedAt: null,
            finishedAt: null,
            participantCount: 0,
            wordCount: 0
        };
        const roomRef = await db.collection(constants_1.COLLECTIONS.ROOMS).add(roomData);
        // Create user document if it doesn't exist
        const userRef = db.collection(constants_1.COLLECTIONS.USERS).doc(context.auth.uid);
        await userRef.set({
            email: context.auth.token.email,
            lastLogin: now,
            roomsCreated: firestore_1.FieldValue.increment(1)
        }, { merge: true });
        return (0, helpers_1.createSuccessResponse)({
            roomId: roomRef.id,
            roomCode: roomCode,
            title: title.trim(),
            url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/room/${roomCode}`
        });
    }
    catch (error) {
        console.error('Error creating room:', error);
        return (0, helpers_1.createErrorResponse)(constants_1.ERROR_CODES.INVALID_INPUT, 'Error interno del servidor');
    }
});
//# sourceMappingURL=createRoom.js.map