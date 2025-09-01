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
exports.helloWorld = exports.manualCleanup = exports.cleanupExpiredRooms = exports.submitWord = exports.activateRoom = exports.joinRoom = exports.createRoom = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
// Export all functions
var createRoom_1 = require("./rooms/createRoom");
Object.defineProperty(exports, "createRoom", { enumerable: true, get: function () { return createRoom_1.createRoom; } });
var joinRoom_1 = require("./rooms/joinRoom");
Object.defineProperty(exports, "joinRoom", { enumerable: true, get: function () { return joinRoom_1.joinRoom; } });
var activateRoom_1 = require("./rooms/activateRoom");
Object.defineProperty(exports, "activateRoom", { enumerable: true, get: function () { return activateRoom_1.activateRoom; } });
var submitWord_1 = require("./words/submitWord");
Object.defineProperty(exports, "submitWord", { enumerable: true, get: function () { return submitWord_1.submitWord; } });
var cleanupExpiredRooms_1 = require("./cleanup/cleanupExpiredRooms");
Object.defineProperty(exports, "cleanupExpiredRooms", { enumerable: true, get: function () { return cleanupExpiredRooms_1.cleanupExpiredRooms; } });
Object.defineProperty(exports, "manualCleanup", { enumerable: true, get: function () { return cleanupExpiredRooms_1.manualCleanup; } });
// Test function for development
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.json({
        message: 'WordCloud Functions are working!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
//# sourceMappingURL=index.js.map