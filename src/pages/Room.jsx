import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useFirebase } from '../contexts/FirebaseContext'
import { db, auth } from '../services/firebase'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import toast from 'react-hot-toast'
import WordCloudVisualization from '../components/WordCloudVisualization'
import { normalizeWord, isValidWord, processWord } from '../utils/wordNormalizer'

const Room = () => {
  const { roomCode } = useParams()
  const { api, subscribeToRoom, subscribeToParticipants, subscribeToWords } = useFirebase()
  
  const [roomData, setRoomData] = useState(null)
  const [participants, setParticipants] = useState([])
  const [words, setWords] = useState([])
  const [word, setWord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [roomLoading, setRoomLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  
  // Get participant data from localStorage (only for regular participants)
  const participant = JSON.parse(localStorage.getItem('participant') || 'null')
  const hasJoined = participant && participant.roomCode === roomCode
  
  // Check if current authenticated user is admin (room creator)
  const currentUser = auth.currentUser
  const isAdmin = currentUser && roomData && currentUser.uid === roomData.createdBy
  
  // Check voted status on mount and when roomCode changes
  useEffect(() => {
    const voted = localStorage.getItem(`voted_${roomCode}`) === 'true'
    console.log('🔧 hasVoted useEffect - roomCode:', roomCode, 'voted from localStorage:', voted)
    setHasVoted(voted)
  }, [roomCode])

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
      // Process and validate the word using normalization
      const wordProcessed = processWord(word.trim())
      
      if (!wordProcessed.isValid) {
        toast.error('La palabra contiene caracteres no válidos o está vacía')
        return
      }

      if (wordProcessed.isEmpty) {
        toast.error('Por favor, ingresa una palabra válida')
        return
      }

      console.log('Word normalization:', {
        original: wordProcessed.original,
        normalized: wordProcessed.normalized
      })

      await api.submitWord({
        roomCode,
        participantId: participant.id,
        word: wordProcessed.original // Send original but server will normalize
      })
      
      // Mark as voted
      localStorage.setItem(`voted_${roomCode}`, 'true')
      setHasVoted(true)
      setWord('')
      toast.success(`¡Palabra "${wordProcessed.normalized}" enviada exitosamente!`)
      
    } catch (error) {
      console.error('Error submitting word:', error)
      toast.error(error.message || 'Error al enviar la palabra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivateRoom = async () => {
    if (isActivating) return
    
    setIsActivating(true)
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
    } finally {
      setIsActivating(false)
    }
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join?code=${roomCode}`
    navigator.clipboard.writeText(link).then(() => {
      toast.success('¡Link copiado al portapapeles!')
    }).catch(() => {
      toast.error('Error al copiar el link')
    })
  }

  // Funciones para modo presentación
  const enterPresentationMode = () => {
    setIsPresentationMode(true)
    // Intentar activar pantalla completa
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error al entrar en pantalla completa:', err)
        toast.error('No se pudo activar pantalla completa')
      })
    }
  }

  const exitPresentationMode = () => {
    setIsPresentationMode(false)
    // Salir de pantalla completa
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.log('Error al salir de pantalla completa:', err)
      })
    }
  }

  // Listener para detectar cuando se sale de pantalla completa con ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresentationMode(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Listener para tecla ESC en modo presentación
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isPresentationMode) {
        exitPresentationMode()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isPresentationMode])

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

  // Componente de modo presentación
  const PresentationMode = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 z-50 flex flex-col">
      {/* Header minimalista */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">{roomTitle}</h1>
            <div className="flex flex-wrap items-center mt-2 text-sm sm:text-base lg:text-lg text-blue-200 gap-x-3 sm:gap-x-6 gap-y-1">
              <span>Código: {roomData.code}</span>
              <span>Participantes: {participantCount}</span>
              <span>Palabras: {words.length}</span>
              <span className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                roomData.state === 'active' ? 'bg-green-500 text-white' :
                roomData.state === 'waiting' ? 'bg-yellow-500 text-black' :
                'bg-gray-500 text-white'
              }`}>
                {roomData.state === 'active' ? 'EN VIVO' : 
                 roomData.state === 'waiting' ? 'ESPERANDO' : 'FINALIZADA'}
              </span>
            </div>
          </div>
          
          <button
            onClick={exitPresentationMode}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Salir de Presentación</span>
            <span className="sm:hidden">Salir</span>
          </button>
        </div>
      </div>

      {/* Área principal de la nube de palabras */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {words.length === 0 ? (
          <div className="text-center max-w-md sm:max-w-2xl">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white opacity-50 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Esperando las primeras palabras...
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-200">
              {roomData.state === 'waiting' ? 'Inicia la sala para comenzar a recibir palabras' : 'Los participantes pueden enviar sus palabras ahora'}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-full w-full">
              <WordCloudVisualization 
                words={words} 
                presentationMode={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer con instrucciones */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm p-3 sm:p-4">
        <div className="flex justify-center items-center text-white">
          <div className="flex items-center text-sm sm:text-base lg:text-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Presiona ESC para salir del modo presentación</span>
            <span className="sm:hidden">Toca el botón "Salir" para terminar la presentación</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Si estamos en modo presentación, mostrar solo ese componente
  if (isPresentationMode) {
    return <PresentationMode />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{roomTitle}</h1>
              <div className="flex flex-wrap items-center mt-1 text-xs sm:text-sm text-gray-600 gap-x-4 gap-y-1">
                <span>Código: {roomData.code}</span>
                <span>Participantes: {participantCount}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  roomData.state === 'active' ? 'bg-green-100 text-green-800' :
                  roomData.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {roomData.state === 'active' ? 'Activa' : 
                   roomData.state === 'waiting' ? 'Esperando' : 'Finalizada'}
                </span>
              </div>
              
              {/* Botones de acción - En móvil van abajo del título */}
              <div className="flex flex-wrap gap-2 mt-3 lg:hidden">
                {/* Botón para copiar link - solo para administradores */}
                {isAdmin && (
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg hover:bg-blue-700"
                    title="Copiar link para invitar participantes"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar Link
                  </button>
                )}
                
                {/* Botón para iniciar la sala */}
                {roomData.state === 'waiting' && (
                  <button
                    onClick={handleActivateRoom}
                    disabled={isActivating}
                    className={`inline-flex items-center px-3 py-2 text-white text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg ${
                      isActivating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    }`}
                  >
                    {isActivating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-8V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002-2V8z" />
                        </svg>
                        Iniciar Sala
                      </>
                    )}
                  </button>
                )}
                
                {/* Botón de modo presentación - solo para administradores */}
                {isAdmin && (
                  <button
                    onClick={enterPresentationMode}
                    className="inline-flex items-center px-3 py-2 text-white text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5.656 5.656m11.314 0L16 4m4 0v4m0-4h-4M4 16v4m0 0h4m-4 0l5.656-5.656M20 20l-5.656-5.656M20 20v-4m0 4h-4" />
                    </svg>
                    Modo Presentación
                  </button>
                )}
              </div>
            </div>
            
            {/* Botones de acción - En desktop van a la derecha */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Botón para copiar link - solo para administradores */}
              {isAdmin && (
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 hover:bg-blue-700"
                  title="Copiar link para invitar participantes"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar Link
                </button>
              )}
              
              {/* Botón para iniciar la sala */}
              {roomData.state === 'waiting' && (
                <button
                  onClick={handleActivateRoom}
                  disabled={isActivating}
                  className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform ${
                    isActivating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105'
                  }`}
                >
                  {isActivating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-8V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002-2V8z" />
                      </svg>
                      Iniciar Sala
                    </>
                  )}
                </button>
              )}
              
              {/* Botón de modo presentación - solo para administradores */}
              {isAdmin && (
                <button
                  onClick={enterPresentationMode}
                  className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5.656 5.656m11.314 0L16 4m4 0v4m0-4h-4M4 16v4m0 0h4m-4 0l5.656-5.656M20 20l-5.656-5.656M20 20v-4m0 4h-4" />
                  </svg>
                  Modo Presentación
                </button>
              )}
            </div>
            
            {/* Información del usuario - En móvil también va abajo */}
            <div className="flex flex-col sm:flex-row sm:justify-between lg:justify-end gap-2 text-right">
              {hasJoined && !isAdmin && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Conectado como:</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{participant.name}</p>
                </div>
              )}
              
              {isAdmin && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Administrador:</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{currentUser.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Word Cloud */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {roomData?.title || 'Word Cloud en Tiempo Real'}
              </h2>
              
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
                  <WordCloudVisualization words={words} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Admin Panel */}
            {isAdmin && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="text-center">
                  <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Panel de Administrador</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Estás viendo esta sala como administrador. Los participantes pueden enviar palabras usando el código: <strong>{roomData.code}</strong>
                  </p>
                </div>
              </div>
            )}
            
            {/* Word Submission - Only for non-admin participants */}
            {!isAdmin && hasJoined && !hasVoted && roomData.state === 'active' && (
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

            {/* Voted Status - Only for participants */}
            {!isAdmin && hasJoined && hasVoted && (
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

            {/* Room Not Active - Different message for admin vs participants */}
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
                    {isAdmin 
                      ? (roomData.state === 'waiting' 
                          ? 'Puedes iniciar la sala cuando estés listo para recibir palabras de los participantes.' 
                          : 'Esta sala ha finalizado.')
                      : (roomData.state === 'waiting' 
                          ? 'El administrador aún no ha iniciado la sala.'
                          : 'Esta sala ha finalizado. No se pueden enviar más palabras.')
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Join Prompt - Only for non-authenticated users */}
            {!hasJoined && !isAdmin && (
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
