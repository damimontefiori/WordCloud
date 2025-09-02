/**
 * Utilidades para normalización de palabras en Firebase Functions
 * Evita duplicados tratando palabras equivalentes como una única entrada
 */

/**
 * Mapa de caracteres con acentos a caracteres sin acentos
 */
const ACCENT_MAP: { [key: string]: string } = {
  'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ā': 'a', 'ã': 'a', 'å': 'a', 'ą': 'a',
  'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e', 'ė': 'e', 'ę': 'e',
  'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i', 'į': 'i',
  'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'ō': 'o', 'õ': 'o', 'ø': 'o', 'ő': 'o',
  'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u', 'ů': 'u', 'ű': 'u', 'ų': 'u',
  'ñ': 'n', 'ń': 'n', 'ň': 'n', 'ņ': 'n',
  'ç': 'c', 'ć': 'c', 'č': 'c', 'ĉ': 'c', 'ċ': 'c',
  'ř': 'r', 'ŕ': 'r',
  'š': 's', 'ś': 's', 'ŝ': 's', 'ş': 's',
  'ť': 't', 'ţ': 't',
  'ý': 'y', 'ÿ': 'y',
  'ž': 'z', 'ź': 'z', 'ż': 'z',
  'ď': 'd', 'đ': 'd',
  'ğ': 'g', 'ĝ': 'g', 'ġ': 'g', 'ģ': 'g',
  'ĥ': 'h', 'ħ': 'h',
  'ĵ': 'j',
  'ķ': 'k', 'ĸ': 'k',
  'ĺ': 'l', 'ļ': 'l', 'ľ': 'l', 'ŀ': 'l', 'ł': 'l',
  'ŵ': 'w',
  // Mayúsculas
  'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A', 'Ā': 'A', 'Ã': 'A', 'Å': 'A', 'Ą': 'A',
  'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E', 'Ē': 'E', 'Ė': 'E', 'Ę': 'E',
  'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I', 'Ī': 'I', 'Į': 'I',
  'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O', 'Ō': 'O', 'Õ': 'O', 'Ø': 'O', 'Ő': 'O',
  'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U', 'Ū': 'U', 'Ů': 'U', 'Ű': 'U', 'Ų': 'U',
  'Ñ': 'N', 'Ń': 'N', 'Ň': 'N', 'Ņ': 'N',
  'Ç': 'C', 'Ć': 'C', 'Č': 'C', 'Ĉ': 'C', 'Ċ': 'C',
  'Ř': 'R', 'Ŕ': 'R',
  'Š': 'S', 'Ś': 'S', 'Ŝ': 'S', 'Ş': 'S',
  'Ť': 'T', 'Ţ': 'T',
  'Ý': 'Y', 'Ÿ': 'Y',
  'Ž': 'Z', 'Ź': 'Z', 'Ż': 'Z',
  'Ď': 'D', 'Đ': 'D',
  'Ğ': 'G', 'Ĝ': 'G', 'Ġ': 'G', 'Ģ': 'G',
  'Ĥ': 'H', 'Ħ': 'H',
  'Ĵ': 'J',
  'Ķ': 'K',
  'Ĺ': 'L', 'Ļ': 'L', 'Ľ': 'L', 'Ŀ': 'L', 'Ł': 'L',
  'Ŵ': 'W'
};

/**
 * Elimina acentos y diacríticos de una cadena
 * @param text - Texto a normalizar
 * @returns Texto sin acentos
 */
function removeAccents(text: string): string {
  return text.split('').map(char => ACCENT_MAP[char] || char).join('');
}

/**
 * Normaliza una palabra aplicando todas las reglas de normalización
 * @param word - Palabra a normalizar
 * @returns Palabra normalizada
 */
export function normalizeWord(word: string): string {
  if (!word || typeof word !== 'string') {
    return '';
  }

  let normalized = word;

  // 1. Trimming: eliminar espacios al inicio y final
  normalized = normalized.trim();

  // 2. Reducir espacios múltiples a uno solo
  normalized = normalized.replace(/\s+/g, ' ');

  // 3. Convertir a minúsculas
  normalized = normalized.toLowerCase();

  // 4. Eliminar acentos y diacríticos
  normalized = removeAccents(normalized);

  // 5. Remover caracteres especiales no permitidos
  // Permitimos solo letras, números, espacios y algunos caracteres básicos
  normalized = normalized.replace(/[^\w\s\-]/g, '');

  // 6. Eliminar espacios invisibles y caracteres de control
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 7. Trim final después de todas las transformaciones
  normalized = normalized.trim();

  return normalized;
}

/**
 * Valida si una palabra normalizada es válida
 * @param normalizedWord - Palabra ya normalizada
 * @returns True si la palabra es válida
 */
export function isValidNormalizedWord(normalizedWord: string): boolean {
  // Debe tener al menos 1 carácter
  if (!normalizedWord || normalizedWord.length === 0) {
    return false;
  }

  // No debe ser solo espacios o guiones
  if (/^[\s\-]+$/.test(normalizedWord)) {
    return false;
  }

  // Debe tener al menos una letra
  if (!/[a-zA-Z]/.test(normalizedWord)) {
    return false;
  }

  // Longitud máxima razonable (50 caracteres)
  if (normalizedWord.length > 50) {
    return false;
  }

  return true;
}

/**
 * Procesa y normaliza una palabra completa con validación
 * @param word - Palabra original
 * @returns Objeto con la palabra normalizada y su validez
 */
export function processWordNormalization(word: string): {
  original: string;
  normalized: string;
  isValid: boolean;
  isEmpty: boolean;
} {
  const normalized = normalizeWord(word);
  const isValid = isValidNormalizedWord(normalized);
  
  return {
    original: word,
    normalized,
    isValid,
    isEmpty: normalized === ''
  };
}
