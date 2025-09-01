// Constants for Firebase Functions
export const COLLECTIONS = {
  ROOMS: 'rooms',
  WORDS: 'words',
  PARTICIPANTS: 'participants',
  USERS: 'users'
} as const;

export const ROOM_STATES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
  EXPIRED: 'expired'
} as const;

export const ROOM_CODE_LENGTH = 6;
export const MAX_WORD_LENGTH = 30;
export const MAX_PARTICIPANTS_PER_ROOM = 100;
export const ROOM_EXPIRY_DAYS = 7;
export const MAX_TIME_LIMIT_MINUTES = 60;

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'room-not-found',
  ROOM_EXPIRED: 'room-expired',
  ROOM_FINISHED: 'room-finished',
  ROOM_FULL: 'room-full',
  ALREADY_VOTED: 'already-voted',
  INVALID_WORD: 'invalid-word',
  UNAUTHORIZED: 'unauthorized',
  INVALID_INPUT: 'invalid-input'
} as const;
