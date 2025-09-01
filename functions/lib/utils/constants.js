"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.MAX_TIME_LIMIT_MINUTES = exports.ROOM_EXPIRY_DAYS = exports.MAX_PARTICIPANTS_PER_ROOM = exports.MAX_WORD_LENGTH = exports.ROOM_CODE_LENGTH = exports.ROOM_STATES = exports.COLLECTIONS = void 0;
// Constants for Firebase Functions
exports.COLLECTIONS = {
    ROOMS: 'rooms',
    WORDS: 'words',
    PARTICIPANTS: 'participants',
    USERS: 'users'
};
exports.ROOM_STATES = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    FINISHED: 'finished',
    EXPIRED: 'expired'
};
exports.ROOM_CODE_LENGTH = 6;
exports.MAX_WORD_LENGTH = 30;
exports.MAX_PARTICIPANTS_PER_ROOM = 100;
exports.ROOM_EXPIRY_DAYS = 7;
exports.MAX_TIME_LIMIT_MINUTES = 60;
exports.ERROR_CODES = {
    ROOM_NOT_FOUND: 'room-not-found',
    ROOM_EXPIRED: 'room-expired',
    ROOM_FINISHED: 'room-finished',
    ROOM_FULL: 'room-full',
    ALREADY_VOTED: 'already-voted',
    INVALID_WORD: 'invalid-word',
    UNAUTHORIZED: 'unauthorized',
    INVALID_INPUT: 'invalid-input'
};
//# sourceMappingURL=constants.js.map