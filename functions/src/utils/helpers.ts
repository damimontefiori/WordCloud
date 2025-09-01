import { ROOM_CODE_LENGTH, MAX_WORD_LENGTH } from './constants';

/**
 * Generate a random room code
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a unique participant name
 */
export const generateUniqueParticipantName = (
  baseName: string, 
  existingNames: string[] = []
): string => {
  if (!baseName || baseName.trim() === '') {
    baseName = `Participante${Math.floor(Math.random() * 1000)}`;
  }

  let uniqueName = baseName.trim();
  let counter = 1;

  while (existingNames.includes(uniqueName)) {
    uniqueName = `${baseName.trim()} ${counter}`;
    counter++;
  }

  return uniqueName;
};

/**
 * Validate word input
 */
export const validateWord = (word: string): { isValid: boolean; error?: string; word?: string } => {
  if (!word || typeof word !== 'string') {
    return { isValid: false, error: 'La palabra es requerida' };
  }

  const trimmedWord = word.trim();

  if (trimmedWord.length === 0) {
    return { isValid: false, error: 'La palabra no puede estar vacía' };
  }

  if (trimmedWord.length > MAX_WORD_LENGTH) {
    return { isValid: false, error: `La palabra no puede tener más de ${MAX_WORD_LENGTH} caracteres` };
  }

  // Allow only letters, numbers, and basic punctuation
  const validWordRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑü0-9\s\-_.]+$/;
  if (!validWordRegex.test(trimmedWord)) {
    return { isValid: false, error: 'La palabra contiene caracteres no permitidos' };
  }

  return { isValid: true, word: trimmedWord };
};

/**
 * Validate room title
 */
export const validateRoomTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'El título es requerido' };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return { isValid: false, error: 'El título no puede estar vacío' };
  }

  if (trimmedTitle.length > 100) {
    return { isValid: false, error: 'El título no puede tener más de 100 caracteres' };
  }

  return { isValid: true };
};

/**
 * Create error response
 */
export const createErrorResponse = (code: string, message: string, details?: any) => {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
};

/**
 * Create success response
 */
export const createSuccessResponse = (data: any) => {
  return {
    success: true,
    data
  };
};
