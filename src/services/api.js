import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase.js';
import { normalizeWord } from '../utils/wordNormalizer.js';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { generateRoomCode } from '../utils/helpers';

// Firebase Functions
export const createRoomFunction = httpsCallable(functions, 'createRoom');
export const joinRoomFunction = httpsCallable(functions, 'joinRoom');
export const submitWordFunction = httpsCallable(functions, 'submitWord');
export const manualCleanupFunction = httpsCallable(functions, 'manualCleanup');

// API wrapper functions
export const apiService = {
  // Fallback: create room directly in Firestore (no Cloud Functions)
  async createRoomDirect(data) {
    if (!auth.currentUser) {
      throw new Error('Debes iniciar sesión para crear una sala');
    }

    // Ensure unique 6-char room code
    let code;
    for (let i = 0; i < 10; i++) {
      const candidate = generateRoomCode();
      const existing = await getDocs(
        query(collection(db, 'rooms'), where('code', '==', candidate))
      );
      if (existing.empty) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      throw new Error('No se pudo generar un código de sala único');
    }

    const payload = {
      title: data?.title || 'Nueva sala',
      description: data?.description || '',
      maxParticipants: Number(data?.maxParticipants) || 50,
      timeLimit: Number(data?.timeLimit) || 30,
      adminEmail: data?.adminEmail || auth.currentUser.email || '',
      code,
      state: data?.state || 'waiting',
      isActive: data?.isActive || false,
      participantCount: 0,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'rooms'), payload);
    return { data: { roomId: ref.id, roomCode: code } };
  },

  // Create a new room
  async createRoom(data) {
    try {
      const result = await createRoomFunction(data);
      return result.data;
    } catch (error) {
      console.warn('Falling back to Firestore (no Functions) for createRoom');
      const result = await this.createRoomDirect(data);
      return result;
    }
  },

  // Join an existing room - Direct Firestore implementation
  async joinRoomDirect(data) {
    const { roomCode, participantName } = data;
    
    // Find the room by code
    const roomQuery = query(
      collection(db, 'rooms'),
      where('code', '==', roomCode.toUpperCase())
    );
    const roomSnapshot = await getDocs(roomQuery);
    
    if (roomSnapshot.empty) {
      throw new Error('Sala no encontrada');
    }
    
    const roomDoc = roomSnapshot.docs[0];
    const roomData = roomDoc.data();
    
    // Check if room exists and is valid
    if (!roomData) {
      throw new Error('Datos de sala inválidos');
    }
    
    // Create participant record
    const participantData = {
      name: participantName,
      roomId: roomDoc.id,
      roomCode: roomCode.toUpperCase(),
      joinedAt: serverTimestamp(),
      isActive: true
    };
    
    const participantRef = await addDoc(collection(db, 'participants'), participantData);
    
    return {
      data: {
        participantId: participantRef.id,
        roomId: roomDoc.id,
        roomCode: roomCode.toUpperCase(),
        roomData: roomData
      }
    };
  },

  // Join an existing room - with Functions fallback
  async joinRoom(data) {
    try {
      // Try Functions first
      const result = await joinRoomFunction(data);
      return result.data;
    } catch (error) {
      console.warn('Falling back to Firestore (no Functions) for joinRoom');
      // Fallback to direct Firestore
      const result = await this.joinRoomDirect(data);
      return result;
    }
  },

  // Submit a word - Direct Firestore implementation
  async submitWordDirect(data) {
    const { word, participantId, roomCode } = data;
    
    // Find the room by code to validate it exists and get room ID
    const roomQuery = query(
      collection(db, 'rooms'),
      where('code', '==', roomCode.toUpperCase())
    );
    const roomSnapshot = await getDocs(roomQuery);
    
    if (roomSnapshot.empty) {
      throw new Error('Sala no encontrada');
    }
    
    const roomDoc = roomSnapshot.docs[0];
    const roomData = roomDoc.data();
    
    // Check if room is active (optional validation)
    if (roomData.state !== 'active') {
      throw new Error('La sala no está activa');
    }
    
    // Normalize the word for consistent storage and duplicate detection
    const normalizedWord = normalizeWord(word.trim());
    
    // Create word record
    const wordData = {
      text: normalizedWord,
      originalText: word.trim(),
      participantId: participantId || 'anonymous',
      roomId: roomDoc.id,
      roomCode: roomCode.toUpperCase(),
      createdAt: serverTimestamp(),
      count: 1
    };
    
    // Check if word already exists for this room (using normalized version)
    const existingWordQuery = query(
      collection(db, 'words'),
      where('roomId', '==', roomDoc.id),
      where('text', '==', normalizedWord)
    );
    
    const existingWordSnapshot = await getDocs(existingWordQuery);
    
    if (!existingWordSnapshot.empty) {
      // Word already exists, increment count
      const existingWordDoc = existingWordSnapshot.docs[0];
      const currentCount = existingWordDoc.data().count || 1;
      await updateDoc(doc(db, 'words', existingWordDoc.id), {
        count: currentCount + 1,
        lastUpdated: serverTimestamp()
      });
      
      return {
        data: {
          wordId: existingWordDoc.id,
          action: 'incremented',
          newCount: currentCount + 1
        }
      };
    } else {
      // New word, create it
      const wordRef = await addDoc(collection(db, 'words'), wordData);
      
      return {
        data: {
          wordId: wordRef.id,
          action: 'created',
          count: 1
        }
      };
    }
  },

  // Submit a word - Direct Firestore only (no Functions)
  async submitWord(data) {
    // Use direct Firestore implementation only
    console.log('🔄 Using direct Firestore for submitWord (Firebase Spark plan)');
    const result = await this.submitWordDirect(data);
    return result;
  },

  // Manual cleanup (admin only)
  async manualCleanup() {
    try {
      const result = await manualCleanupFunction();
      return result.data;
    } catch (error) {
      console.error('Error in manual cleanup:', error);
      throw new Error(error.message || 'Error en la limpieza manual');
    }
  },

  // Start a room (Firestore direct)
  async startRoom(roomId) {
    if (!auth.currentUser) throw new Error('No autenticado');
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      state: 'active',
      isActive: true,
      activatedAt: serverTimestamp(),
    });
    return { ok: true };
  },

  // End a room (Firestore direct)
  async endRoom(roomId) {
    if (!auth.currentUser) throw new Error('No autenticado');
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      state: 'ended',
      isActive: false,
      endedAt: serverTimestamp(),
    });
    return { ok: true };
  },
};
