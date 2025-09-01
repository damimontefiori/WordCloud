import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useFirebase } from '../contexts/FirebaseContext'
import toast from 'react-hot-toast'

const Room = () => {
  const { roomId } = useParams()
  const { api, subscribeToRoom, subscribeToParticipants, subscribeToWords } = useFirebase()
  
  const [roomData, setRoomData] = useState(null)
  const [participants, setParticipants] = useState([])
  const [words, setWords] = useState([])
  const [word, setWord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [roomLoading, setRoomLoading] = useState(true)
  
  // Get participant data from localStorage
  const participant = JSON.parse(localStorage.getItem('participant') || 'null')
  const hasJoined = participant && participant.roomId === roomId
  const hasVoted = localStorage.getItem(`voted_${roomId}`) === 'true'

  // Get participant data from localStorage
  const participant = JSON.parse(localStorage.getItem('participant') || 'null')
  const hasJoined = participant && participant.roomId === roomId
  const hasVoted = localStorage.getItem(`voted_${roomId}`) === 'true'

  // Set up real-time listeners
  useEffect(() => {
    if (!roomId) return

    setRoomLoading(true)

    // Subscribe to room data
    const roomUnsubscribe = subscribeToRoom(roomId, (roomSnap) => {
      if (roomSnap.exists()) {
        setRoomData(roomSnap.data())
      } else {
        toast.error('Sala no encontrada')
      }
      setRoomLoading(false)
    })

    // Subscribe to participants
    const participantsUnsubscribe = subscribeToParticipants(roomId, (participantsSnap) => {
      const participantsList = participantsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setParticipants(participantsList)
    })

    // Subscribe to words
    const wordsUnsubscribe = subscribeToWords(roomId, (wordsSnap) => {
      const wordsList = wordsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Transform for word cloud display
      const wordCloudData = wordsList.map(word => ({
        text: word.text,
        count: word.count,
        size: Math.min(12 + (word.count * 3), 36) // Size based on count
      }))
      
      setWords(wordCloudData)
    })

    // Cleanup subscriptions
    return () => {
      roomUnsubscribe()
      participantsUnsubscribe()
      wordsUnsubscribe()
    }
  }, [roomId])

  const handleSubmitWord = async (e) => {
    e.preventDefault()
    if (!word.trim() || !hasJoined || hasVoted) return

    setIsLoading(true)
    
    try {
      await api.submitWord({
        roomId,
        participantId: participant.id,
        word: word.trim()
      })
      
      // Mark as voted
      localStorage.setItem(`voted_${roomId}`, 'true')
      setWord('')
      toast.success('¡Palabra enviada exitosamente!')
      
    } catch (error) {
      console.error('Error submitting word:', error)
      toast.error(error.message || 'Error al enviar la palabra')
    } finally {
      setIsLoading(false)
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
      ))
    } else {
      setWords([...words, { text: word, count: 1, size: 12 }])
    }
    
    setHasVoted(true)
    setIsLoading(false)
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">{roomCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{roomTitle}</h1>
            <p className="text-gray-600">Sala: {roomCode}</p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card">
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre (opcional)
                </label>
                <input
                  id="name"
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="input"
                  placeholder="Deja vacío para nombre automático"
                  maxLength={30}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Se generará un nombre automático si lo dejas vacío
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn btn-primary py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uniéndose...
                  </div>
                ) : (
                  'Unirse a la sala'
                )}
              </button>
            </form>

            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Importante
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    Solo podrás enviar una palabra. ¡Piénsala bien!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{roomTitle}</h1>
              <p className="text-sm text-gray-600">
                Sala: {roomCode} • {participantCount} participantes • Conectado como: {participantName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">En vivo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Word Cloud Display */}
          <div className="lg:col-span-2">
            <div className="card min-h-96">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Word Cloud en Tiempo Real</h2>
              
              <div className="bg-gray-50 rounded-lg p-8 min-h-80 flex flex-wrap items-center justify-center">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className="word-cloud-item bg-primary-100 text-primary-800 m-2 px-3 py-1 rounded-full font-medium"
                    style={{ 
                      fontSize: `${word.size}px`,
                      opacity: 0.7 + (word.count * 0.1)
                    }}
                  >
                    {word.text} ({word.count})
                  </span>
                ))}
                
                {words.length === 0 && (
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Esperando las primeras palabras...</p>
                    <p className="text-sm">¡Las palabras aparecerán aquí en tiempo real!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participation Panel */}
          <div className="space-y-6">
            {!hasVoted ? (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Envía tu palabra</h3>
                
                <form onSubmit={handleSubmitWord} className="space-y-4">
                  <div>
                    <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-2">
                      Tu palabra
                    </label>
                    <input
                      id="word"
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value.slice(0, 30))}
                      className="input"
                      placeholder="Escribe una palabra..."
                      maxLength={30}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Máximo 30 caracteres
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !word.trim()}
                    className={`w-full btn btn-primary py-3 ${
                      isLoading || !word.trim() ? 'opacity-50 cursor-not-allowed' : ''
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

                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Solo puedes enviar una palabra. ¡Elige la que mejor represente el tema!
                  </p>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Palabra enviada!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tu palabra "{word}" ha sido añadida al Word Cloud. 
                    ¡Ve cómo evoluciona en tiempo real!
                  </p>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participantes:</span>
                  <span className="font-medium">{participantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Palabras únicas:</span>
                  <span className="font-medium">{words.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total envíos:</span>
                  <span className="font-medium">{words.reduce((sum, w) => sum + w.count, 0)}</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="card bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-2">¿Cómo funciona?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Las palabras más populares aparecen más grandes</li>
                <li>• El Word Cloud se actualiza en tiempo real</li>
                <li>• Solo puedes enviar una palabra por sala</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
