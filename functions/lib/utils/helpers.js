"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = exports.createErrorResponse = exports.validateRoomTitle = exports.validateWord = exports.generateUniqueParticipantName = exports.generateRoomCode = void 0;
const constants_1 = require("./constants");
/**
 * Generate a random room code
 */
const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < constants_1.ROOM_CODE_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRoomCode = generateRoomCode;
/**
 * Generate a unique participant name
 */
const generateUniqueParticipantName = (baseName, existingNames = []) => {
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
exports.generateUniqueParticipantName = generateUniqueParticipantName;
/**
 * Validate word input
 */
const validateWord = (word) => {
    if (!word || typeof word !== 'string') {
        return { isValid: false, error: 'La palabra es requerida' };
    }
    const trimmedWord = word.trim();
    if (trimmedWord.length === 0) {
        return { isValid: false, error: 'La palabra no puede estar vacía' };
    }
    if (trimmedWord.length > constants_1.MAX_WORD_LENGTH) {
        return { isValid: false, error: `La palabra no puede tener más de ${constants_1.MAX_WORD_LENGTH} caracteres` };
    }
    // Allow only letters, numbers, and basic punctuation
    const validWordRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑü0-9\s\-_.]+$/;
    if (!validWordRegex.test(trimmedWord)) {
        return { isValid: false, error: 'La palabra contiene caracteres no permitidos' };
    }
    return { isValid: true, word: trimmedWord };
};
exports.validateWord = validateWord;
/**
 * Validate room title
 */
const validateRoomTitle = (title) => {
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
exports.validateRoomTitle = validateRoomTitle;
/**
 * Create error response
 */
const createErrorResponse = (code, message, details) => {
    return {
        success: false,
        error: {
            code,
            message,
            details
        }
    };
};
exports.createErrorResponse = createErrorResponse;
/**
 * Create success response
 */
const createSuccessResponse = (data) => {
    return {
        success: true,
        data
    };
};
exports.createSuccessResponse = createSuccessResponse;
//# sourceMappingURL=helpers.js.map