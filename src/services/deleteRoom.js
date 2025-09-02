import { auth, db } from './firebase.js';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction
} from 'firebase/firestore';

/**
 * Delete a room and all its associated data (admin only)
 * @param {string} roomId - The ID of the room to delete
 * @returns {Promise<object>} - Result object with success status and deletion counts
 */
export const deleteRoom = async (roomId) => {
  if (!auth.currentUser) throw new Error('No autenticado');
  
  console.log('🗑️ Eliminando sala y todos sus datos asociados:', roomId);
  
  try {
    // Since we can't do queries inside transactions, we'll do the deletion in steps
    // Step 1: Get all associated documents
    console.log('🔍 Buscando datos asociados a la sala...');
    
    // Get all participants for this room
    const participantsQuery = query(
      collection(db, 'participants'),
      where('roomId', '==', roomId)
    );
    const participantsSnapshot = await getDocs(participantsQuery);
    console.log(`📋 Encontrados ${participantsSnapshot.size} participantes`);
    
    // Get all words for this room  
    const wordsQuery = query(
      collection(db, 'words'),
      where('roomId', '==', roomId)
    );
    const wordsSnapshot = await getDocs(wordsQuery);
    console.log(`💬 Encontradas ${wordsSnapshot.size} palabras`);
    
    // Step 2: Delete all associated data in a transaction
    await runTransaction(db, async (transaction) => {
      // Verify room ownership again
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await transaction.get(roomRef);
      
      if (!roomDoc.exists()) {
        throw new Error('Sala no encontrada');
      }
      
      const roomData = roomDoc.data();
      if (roomData.createdBy !== auth.currentUser.uid) {
        throw new Error('No tienes permisos para eliminar esta sala');
      }
      
      // Delete all participants
      participantsSnapshot.docs.forEach(participantDoc => {
        transaction.delete(participantDoc.ref);
      });
      
      // Delete all words
      wordsSnapshot.docs.forEach(wordDoc => {
        transaction.delete(wordDoc.ref);
      });
      
      // Finally, delete the room itself
      transaction.delete(roomRef);
    });
    
    console.log('✅ Sala eliminada completamente');
    return { ok: true, deletedCounts: {
      participants: participantsSnapshot.size,
      words: wordsSnapshot.size
    }};
    
  } catch (error) {
    console.error('❌ Error eliminando sala:', error);
    throw new Error(error.message || 'Error al eliminar la sala');
  }
};
