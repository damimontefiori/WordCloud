import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useFirebase } from '../contexts/FirebaseContext'
import { useAuth } from '../contexts/AuthContext'
import { getRandomGeekName } from '../utils/geekNames'
import useDeviceDetection from '../hooks/useDeviceDetection'
import toast from 'react-hot-toast'

const MobileJoinPage = () => {
  const { roomCode } = useParams()
  const [searchParams] = useSearchParams()
  const deviceInfo = useDeviceDetection()
  const { api } = useFirebase()
  const { currentUser } = useAuth()

  const [room, setRoom] = useState(null)
  const [participant, setParticipant] = useState({ name: '', code: roomCode || '' })
  const [isJoining, setIsJoining] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Auto-llenar código desde URL
  useEffect(() => {
    const codeFromUrl = roomCode || searchParams.get('code') || searchParams.get('sala')
    if (codeFromUrl && codeFromUrl !== participant.code) {
      setParticipant(prev => ({ ...prev, code: codeFromUrl }))
    }
  }, [roomCode, searchParams])

  // 🔧 Autocompletar nombre con email del usuario logueado
  useEffect(() => {
    if (currentUser?.email && !participant.name) {
      console.log('📱 MobileJoin - Autocompletando nombre con:', currentUser.email)
      setParticipant(prev => ({ ...prev, name: currentUser.email }))
    }
  }, [currentUser, participant.name])

  // Buscar sala automáticamente cuando hay código completo (6 dígitos)
  useEffect(() => {
    if (participant.code && participant.code.length >= 6) {
      checkRoom(participant.code)
    } else if (participant.code && participant.code.length < 6) {
      // Limpiar estado si el código es incompleto
      setRoom(null)
      setError('')
      setLoading(false)
    }
  }, [participant.code])

  const checkRoom = async (code) => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Buscando sala con código:', code)
      
      // Buscar sala por el campo 'code' en lugar de por ID del documento
      const roomsRef = collection(db, 'rooms')
      const q = query(roomsRef, where('code', '==', code.toUpperCase()))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0]
        const roomData = roomDoc.data()
        console.log('✅ Sala encontrada:', roomData)
        setRoom({ id: roomDoc.id, ...roomData })
      } else {
        console.log('❌ Sala no encontrada para código:', code)
        setRoom(null)
        setError('Sala no encontrada')
      }
    } catch (err) {
      console.error('Error checking room:', err)
      setError('Error al buscar la sala')
      setRoom(null)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!room) {
      toast.error('Primero debes encontrar una sala válida')
      return
    }

    if (room.state !== 'active' && room.state !== 'waiting') {
      toast.error('La sala no está disponible en este momento')
      return
    }

    try {
      setIsJoining(true)
      
      // Si no hay nombre, asignar uno automáticamente
      const finalName = participant.name.trim() || getRandomGeekName()
      
      console.log('🚀 Uniéndose a sala:', room.code, 'con nombre:', finalName)
      
      // Use the API to properly join the room (same as desktop Join component)
      const result = await api.joinRoom({
        roomCode: room.code,
        participantName: finalName
      })
      
      console.log('🎉 Successfully joined room:', result)
      
      // Save participant info to localStorage (required for Room component)
      const participantInfo = {
        id: result.data.participantId,
        name: finalName,
        roomCode: room.code,
        roomId: result.data.roomId,
        joinedAt: new Date().toISOString()
      }
      
      localStorage.setItem('participant', JSON.stringify(participantInfo))
      
      console.log('💾 Participant info saved:', participantInfo)
      
      // Show success message
      toast.success(`¡Te has unido como "${finalName}" a la sala ${room.code}!`)
      
      // Navigate to the room (using window.location for mobile compatibility)
      window.location.href = `/room/${room.code}`
      
    } catch (error) {
      console.error('Error joining room:', error)
      toast.error(error.message || 'Error al unirse a la sala')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCodeChange = (e) => {
    const code = e.target.value.toUpperCase()
    setParticipant(prev => ({ ...prev, code }))
  }

  const handleNameChange = (e) => {
    setParticipant(prev => ({ ...prev, name: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header móvil simplificado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg mr-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">WordCloud</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unirse a Sala</h2>
            <p className="text-gray-600">Ingresa el código de la sala para participar</p>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            {/* Input de código */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Sala
              </label>
              <input
                type="text"
                value={participant.code}
                onChange={handleCodeChange}
                placeholder="Ej: ABC123"
                className="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase tracking-widest font-mono"
                maxLength={6}
                autoComplete="off"
                style={{ fontSize: '18px' }} // Evita zoom en iOS
              />
              {loading && participant.code.length >= 6 && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando sala...</span>
                </div>
              )}
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>

            {/* Información de la sala */}
            {room && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-800">Sala encontrada</span>
                </div>
                <h3 className="font-semibold text-gray-900">{room.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{room.participants?.length || 0} participantes</span>
                  <span className={`px-2 py-1 rounded-full ${
                    room.state === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : room.state === 'waiting'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.state === 'active' ? 'Activa' : room.state === 'waiting' ? 'Esperando' : 'Inactiva'}
                  </span>
                </div>
              </div>
            )}

            {/* Input de nombre (opcional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentUser ? 'Tu nombre' : 'Tu Nombre (opcional)'}
              </label>
              <input
                type="text"
                value={participant.name}
                onChange={handleNameChange}
                placeholder={currentUser ? currentUser.email : "Si no ingresas, se asignará automáticamente"}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  currentUser ? 'bg-green-50 border-green-300' : 'border-gray-300'
                }`}
                style={{ fontSize: '16px' }}
              />
              {currentUser ? (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Autocompletado con tu cuenta: {currentUser.email}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  💡 Si lo dejas vacío, te asignaremos un nombre genial automáticamente
                </p>
              )}
            </div>

            {/* Botón de unirse */}
            <button
              onClick={handleJoinRoom}
              disabled={!room || isJoining || (room?.state !== 'active' && room?.state !== 'waiting')}
              className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 ${
                room && (room.state === 'active' || room.state === 'waiting') && !isJoining
                  ? 'bg-primary-600 text-white hover:bg-primary-700 transform hover:scale-105 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uniéndose...
                </div>
              ) : room && (room.state === 'active' || room.state === 'waiting') ? (
                '🚀 Unirse a la Sala'
              ) : room && room.state !== 'active' && room.state !== 'waiting' ? (
                '⏸️ Sala No Disponible'
              ) : participant.code.length < 6 ? (
                '📝 Ingresa código completo (6 dígitos)'
              ) : (
                '🔍 Buscar Sala Primero'
              )}
            </button>
          </div>

          {/* Información adicional */}
          <div className="text-center text-sm text-gray-500">
            <p>¿No tienes un código? Pídele uno al organizador de la sesión</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileJoinPage
