import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useFirebase } from '../contexts/FirebaseContext'
import { db } from '../services/firebase'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import toast from 'react-hot-toast'

const Room = () => {
  const { roomCode } = useParams()
  const { api, subscribeToRoom, subscribeToParticipants, subscribeToWords } = useFirebase()
  
  const [roomData, setRoomData] = useState(null)
  const [participants, setParticipants] = useState([])
  const [words, setWords] = useState([])
  const [word, setWord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [roomLoading, setRoomLoading] = useState(true)
  
  // Get participant data from localStorage
  const participant = JSON.parse(localStorage.getItem('participant') || 'null')
  const hasJoined = participant && participant.roomCode === roomCode
  const hasVoted = localStorage.getItem(`voted_${roomCode}`) === 'true'

  // Set up real-time listeners
  useEffect(() => {
    if (!roomCode) return

    setRoomLoading(true)

    // Subscribe to room data
    const roomUnsubscribe = subscribeToRoom(roomCode, (roomSnap) => {
      if (roomSnap.exists()) {
        setRoomData(roomSnap.data())
      } else {
        toast.error('Sala no encontrada')
      }
      setRoomLoading(false)
    })

    // Cleanup subscription
    return () => {
      roomUnsubscribe()
    }
  }, [roomCode, subscribeToRoom])

  // Set up participants and words listeners when we have roomData
  useEffect(() => {
    if (!roomData?.id) return

    // Subscribe to participants
    const participantsUnsubscribe = subscribeToParticipants(roomData.id, (participantsSnap) => {
      const participantsList = participantsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setParticipants(participantsList)
    })

    // Subscribe to words
    const wordsUnsubscribe = subscribeToWords(roomData.id, (wordsSnap) => {
      console.log('🔍 Words subscription triggered, roomId:', roomData.id)
      console.log('📝 Words snapshot size:', wordsSnap.size)
      
      const wordsList = wordsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('📋 Words list:', wordsList)
      
      // Transform for word cloud display
      const wordCloudData = wordsList.map(wordItem => ({
        text: wordItem.text,
        count: wordItem.count,
        size: Math.min(12 + (wordItem.count * 3), 36) // Size based on count
      }))
      
      console.log('☁️ Word cloud data:', wordCloudData)
      setWords(wordCloudData)
    })

    // Cleanup subscriptions
    return () => {
      participantsUnsubscribe()
      wordsUnsubscribe()
    }
  }, [roomData?.id, subscribeToParticipants, subscribeToWords])

  const handleSubmitWord = async (e) => {
    e.preventDefault()
    if (!word.trim() || !hasJoined || hasVoted) return

    setIsLoading(true)
    
    try {
      await api.submitWord({
        roomCode,
        participantId: participant.id,
        word: word.trim()
      })
      
      // Mark as voted
      localStorage.setItem(`voted_${roomCode}`, 'true')
      setWord('')
      toast.success('¡Palabra enviada exitosamente!')
      
    } catch (error) {
      console.error('Error submitting word:', error)
      toast.error(error.message || 'Error al enviar la palabra')
    } finally {
      setIsLoading(false)
    }
  }

  // Función temporal para activar la sala (solo para demostración)
  const handleActivateRoom = async () => {
    try {
      // Find room by code
      const roomsRef = collection(db, 'rooms')
      const q = query(roomsRef, where('code', '==', roomCode.toUpperCase()))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        toast.error('Sala no encontrada')
        return
      }
      
      const roomDoc = querySnapshot.docs[0]
      
      // Update room to active state
      await updateDoc(roomDoc.ref, {
        state: 'active',
        isActive: true,
        activatedAt: new Date()
      })
      
      toast.success('¡Sala activada! Ahora puedes enviar palabras.')
    } catch (error) {
      console.error('Error activating room:', error)
      toast.error('Error al activar la sala')
    }
  }

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sala...</p>
        </div>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sala no encontrada</h2>
          <p className="text-gray-600">Esta sala no existe o ha sido eliminada.</p>
        </div>
      </div>
    )
  }

  const roomTitle = roomData.title || 'Word Cloud'
  const participantCount = participants.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{roomTitle}</h1>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="mr-4">Código: {roomData.code}</span>
                <span className="mr-4">Participantes: {participantCount}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  roomData.state === 'active' ? 'bg-green-100 text-green-800' :
                  roomData.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {roomData.state === 'active' ? 'Activa' : 
                   roomData.state === 'waiting' ? 'Esperando' : 'Finalizada'}
                </span>
                {/* Botón temporal para activar la sala (solo para demostración) */}
                {roomData.state === 'waiting' && (
                  <button
                    onClick={handleActivateRoom}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    🚀 Activar Sala (Demo)
                  </button>
                )}
              </div>
            </div>
            
            {hasJoined && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Conectado como:</p>
                <p className="font-semibold text-gray-900">{participant.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Word Cloud */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Word Cloud en Tiempo Real</h2>
              
              {words.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Esperando las primeras palabras...
                  </h3>
                  <p className="text-gray-600">
                    ¡Sé el primero en enviar una palabra!
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4 py-8 min-h-[300px]">
                  {words.map((wordData, index) => (
                    <span
                      key={index}
                      className="text-primary-600 font-semibold select-none"
                      style={{
                        fontSize: `${wordData.size}px`,
                        opacity: 0.7 + (wordData.count * 0.1)
                      }}
                    >
                      {wordData.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Word Submission */}
            {hasJoined && !hasVoted && roomData.state === 'active' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Envía tu palabra</h3>
                <form onSubmit={handleSubmitWord} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder="Escribe una palabra..."
                      className="input"
                      maxLength={50}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!word.trim() || isLoading}
                    className={`btn btn-primary w-full ${
                      !word.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Palabra'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Voted Status */}
            {hasJoined && hasVoted && (
              <div className="card bg-green-50 border-green-200">
                <div className="text-center">
                  <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-900 mb-1">¡Palabra enviada!</h3>
                  <p className="text-green-700 text-sm">
                    Gracias por tu participación. Puedes ver los resultados en tiempo real.
                  </p>
                </div>
              </div>
            )}

            {/* Room Not Active */}
            {roomData.state !== 'active' && (
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="text-center">
                  <svg className="w-8 h-8 text-yellow-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                    {roomData.state === 'waiting' ? 'Sala en espera' : 'Sala finalizada'}
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    {roomData.state === 'waiting' 
                      ? 'El administrador aún no ha iniciado la sala.'
                      : 'Esta sala ha finalizado. No se pueden enviar más palabras.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Join Prompt */}
            {!hasJoined && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="text-center">
                  <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Únete a la sala</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Para participar, ve a la página de unión e ingresa el código de esta sala.
                  </p>
                  <a href="/join" className="btn bg-blue-600 text-white hover:bg-blue-700">
                    Ir a unirse
                  </a>
                </div>
              </div>
            )}

            {/* Participants List */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participantes ({participantCount})
              </h3>
              {participants.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay participantes aún</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participantItem) => (
                    <div key={participantItem.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-900">{participantItem.name}</span>
                      <span className="text-xs text-gray-500">
                        {participantItem.hasVoted ? '✓ Votado' : 'Esperando...'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
