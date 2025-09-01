import { ROOM_CODE_LENGTH, MAX_WORD_LENGTH, WORD_COLORS, MIN_FONT_SIZE, MAX_FONT_SIZE } from './constants'

/**
 * Generate a random room code
 * @returns {string} 6-character alphanumeric code
 */
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a unique participant name
 * @param {string} baseName - Base name provided by user
 * @param {string[]} existingNames - Array of existing names in room
 * @returns {string} Unique participant name
 */
export const generateUniqueParticipantName = (baseName, existingNames = []) => {
  if (!baseName || baseName.trim() === '') {
    baseName = `Participante${Math.floor(Math.random() * 1000)}`
  }

  let uniqueName = baseName.trim()
  let counter = 1

  while (existingNames.includes(uniqueName)) {
    uniqueName = `${baseName.trim()} ${counter}`
    counter++
  }

  return uniqueName
}

/**
 * Validate word input
 * @param {string} word - Word to validate
 * @returns {object} Validation result with isValid and error
 */
export const validateWord = (word) => {
  if (!word || typeof word !== 'string') {
    return { isValid: false, error: 'La palabra es requerida' }
  }

  const trimmedWord = word.trim()

  if (trimmedWord.length === 0) {
    return { isValid: false, error: 'La palabra no puede estar vacía' }
  }

  if (trimmedWord.length > MAX_WORD_LENGTH) {
    return { isValid: false, error: `La palabra no puede tener más de ${MAX_WORD_LENGTH} caracteres` }
  }

  // Allow only letters, numbers, and basic punctuation
  const validWordRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑü0-9\s\-_.]+$/
  if (!validWordRegex.test(trimmedWord)) {
    return { isValid: false, error: 'La palabra contiene caracteres no permitidos' }
  }

  return { isValid: true, word: trimmedWord }
}

/**
 * Calculate font size for word based on frequency
 * @param {number} count - Word frequency
 * @param {number} maxCount - Maximum frequency in the dataset
 * @returns {number} Font size in pixels
 */
export const calculateWordSize = (count, maxCount) => {
  if (maxCount === 0) return MIN_FONT_SIZE

  const ratio = count / maxCount
  const sizeRange = MAX_FONT_SIZE - MIN_FONT_SIZE
  const size = MIN_FONT_SIZE + (ratio * sizeRange)

  return Math.round(size)
}

/**
 * Get a color for a word based on its index
 * @param {number} index - Word index
 * @returns {string} Hex color
 */
export const getWordColor = (index) => {
  return WORD_COLORS[index % WORD_COLORS.length]
}

/**
 * Format timestamp to readable date
 * @param {Date|number} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculate time remaining
 * @param {Date} endTime - End time
 * @returns {object} Time remaining object
 */
export const getTimeRemaining = (endTime) => {
  const now = new Date()
  const timeLeft = endTime - now

  if (timeLeft <= 0) {
    return { expired: true, minutes: 0, seconds: 0 }
  }

  const minutes = Math.floor(timeLeft / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return { expired: false, minutes, seconds }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Generate room URL
 * @param {string} roomCode - Room code
 * @returns {string} Full room URL
 */
export const generateRoomUrl = (roomCode) => {
  return `${window.location.origin}/room/${roomCode}`
}

/**
 * Sanitize filename for downloads
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
