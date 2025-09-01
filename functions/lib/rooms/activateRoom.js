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
exports.activateRoom = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const constants_1 = require("../utils/constants");
const db = admin.firestore();
exports.activateRoom = functions.https.onCall(async (data, context) => {
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
        const roomQuery = await db.collection(constants_1.COLLECTIONS.ROOMS)
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
            state: constants_1.ROOM_STATES.ACTIVE,
            isActive: true,
            activatedAt: admin.firestore.Timestamp.now()
        });
        return {
            success: true,
            message: 'Room activated successfully'
        };
    }
    catch (error) {
        console.error('Error activating room:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Internal server error');
    }
});
//# sourceMappingURL=activateRoom.js.map