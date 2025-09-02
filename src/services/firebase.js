// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration (must come from .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Debug log: Show all environment variables for troubleshooting
console.log('Environment variables check:', {
  API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING',
  AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING',
  PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
  STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'SET' : 'MISSING',
  MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'MISSING',
  APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? 'SET' : 'MISSING'
})

// Validate required config
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
]
for (const k of requiredKeys) {
  if (!firebaseConfig[k]) {
    throw new Error(`Firebase config missing: ${k}. Check your .env (VITE_ variables).`)
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Debug: log loaded config safely to verify environment
try {
  const apiKey = firebaseConfig.apiKey || ''
  const maskedKey = apiKey ? `${apiKey.slice(0, 6)}…${apiKey.slice(-4)}` : 'none'
  // eslint-disable-next-line no-console
  console.log('Firebase config loaded', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: maskedKey,
    useEmulators: (import.meta.env.VITE_USE_EMULATORS || '').toString().toLowerCase() === 'true'
  })
} catch (_) {
  // noop
}

// Connect to emulators only when explicitly enabled
const useEmulators = (import.meta.env.VITE_USE_EMULATORS || '').toString().toLowerCase() === 'true'
if (import.meta.env.DEV && useEmulators) {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099')
    console.log('🔧 Connected to Firebase emulators')
  } catch (error) {
    console.log('ℹ️ Firebase emulators not available or already connected')
  }
}

// Export app instance
export default app;
