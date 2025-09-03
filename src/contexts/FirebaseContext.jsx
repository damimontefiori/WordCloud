import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, functions, googleProvider } from '../services/firebase'
import { apiService } from '../services/api'
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore'

const FirebaseContext = createContext()

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}

export const FirebaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Verificar que Firebase esté inicializado correctamente
        console.log('Inicializando Firebase Context...')
        console.log('Auth:', !!auth)
        console.log('DB:', !!db)
        console.log('Functions:', !!functions)
        
        setIsInitialized(true)
      } catch (err) {
        console.error('Error inicializando Firebase:', err)
        setError(err)
      }
    }

    initializeFirebase()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Firebase</h1>
          <p className="text-gray-600 mb-4">Error al inicializar Firebase:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {error.toString()}
          </pre>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando...</h1>
          <p className="text-gray-600">Inicializando Firebase...</p>
        </div>
      </div>
    )
  }

  const value = {
    auth,
    db,
    functions,
    googleProvider,
    api: apiService,
    
    // Real-time listeners
    subscribeToRoom: (roomCode, callback) => {
      // Query by room code instead of room ID
      const roomQuery = query(
        collection(db, 'rooms'),
        where('code', '==', roomCode),
        limit(1)
      )
      return onSnapshot(roomQuery, (snapshot) => {
        if (!snapshot.empty) {
          const roomDoc = snapshot.docs[0]
          callback({
            exists: () => true,
            data: () => ({
              id: roomDoc.id,
              ...roomDoc.data()
            })
          })
        } else {
          callback({
            exists: () => false,
            data: () => null
          })
        }
      })
    },
    
    subscribeToParticipants: (roomId, callback) => {
      console.log('🔍 Setting up participants subscription for roomId:', roomId)
      const participantsQuery = query(
        collection(db, 'participants'),
        where('roomId', '==', roomId)
        // TODO: Add orderBy after creating index in Firestore
        // orderBy('joinedAt', 'asc')
      )
      return onSnapshot(participantsQuery, (snapshot) => {
        console.log('📝 Participants subscription fired, snapshot size:', snapshot.size)
        snapshot.docs.forEach(doc => {
          console.log('📄 Participant doc:', doc.id, doc.data())
        })
        callback(snapshot)
      })
    },
    
    subscribeToWords: (roomId, callback) => {
      console.log('🔍 Setting up words subscription for roomId:', roomId)
      const wordsQuery = query(
        collection(db, 'words'),
        where('roomId', '==', roomId)
        // TODO: Add orderBy after creating index in Firestore
        // orderBy('createdAt', 'desc')
      )
      return onSnapshot(wordsQuery, (snapshot) => {
        console.log('📝 Words subscription fired, snapshot size:', snapshot.size)
        snapshot.docs.forEach(doc => {
          console.log('📄 Word doc:', doc.id, doc.data())
        })
        callback(snapshot)
      })
    }
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}