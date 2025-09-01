// App constants
export const APP_NAME = 'WordCloud App'
export const APP_VERSION = '1.0.0'

// Room constants
export const ROOM_CODE_LENGTH = 6
export const MAX_ROOM_TITLE_LENGTH = 100
export const MAX_WORD_LENGTH = 30
export const MAX_PARTICIPANTS_PER_ROOM = 100
export const ROOM_EXPIRY_DAYS = 7
export const MAX_TIME_LIMIT_MINUTES = 60

// Participant constants
export const MAX_PARTICIPANT_NAME_LENGTH = 30
export const DEFAULT_PARTICIPANT_PREFIX = 'Participante'

// Word Cloud constants
export const MIN_FONT_SIZE = 12
export const MAX_FONT_SIZE = 48
export const WORD_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
]

// Firebase collection names
export const COLLECTIONS = {
  ROOMS: 'rooms',
  WORDS: 'words',
  PARTICIPANTS: 'participants',
  USERS: 'users'
}

// Room states
export const ROOM_STATES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
  EXPIRED: 'expired'
}

// Error messages
export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: 'Sala no encontrada',
  ROOM_EXPIRED: 'La sala ha expirado',
  ROOM_FINISHED: 'La sala ha finalizado',
  ALREADY_VOTED: 'Ya has enviado tu palabra',
  INVALID_WORD: 'Palabra inválida',
  WORD_TOO_LONG: `La palabra no puede tener más de ${MAX_WORD_LENGTH} caracteres`,
  ROOM_FULL: 'La sala está llena',
  NETWORK_ERROR: 'Error de conexión',
  UNAUTHORIZED: 'No autorizado'
}

// Success messages
export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Sala creada exitosamente',
  WORD_SUBMITTED: 'Palabra enviada exitosamente',
  ROOM_JOINED: 'Te has unido a la sala',
  ROOM_FINISHED: 'Sala finalizada',
  ROOM_DELETED: 'Sala eliminada'
}
