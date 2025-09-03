import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getRandomGeekName } from '../utils/geekNames'
import useDeviceDetection from '../hooks/useDeviceDetection'
import toast from 'react-hot-toast'

const MobileJoinPage = () => {
  const { roomCode } = useParams()
  const [searchParams] = useSearchParams()
  const deviceInfo = useDeviceDetection()

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

  // Buscar sala automáticamente cuando hay código
  useEffect(() => {
    if (participant.code && participant.code.length >= 4) {
      checkRoom(participant.code)
    }
  }, [participant.code])

  const checkRoom = async (code) => {
    try {
      setLoading(true)
      setError('')
      
      const roomDoc = await getDoc(doc(db, 'rooms', code.toUpperCase()))
      if (roomDoc.exists()) {
        const roomData = roomDoc.data()
        setRoom({ id: roomDoc.id, ...roomData })
      } else {
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

    if (room.status !== 'active') {
      toast.error('La sala no está activa en este momento')
      return
    }

    try {
      setIsJoining(true)
      
      // Si no hay nombre, asignar uno automáticamente
      const finalName = participant.name.trim() || getRandomGeekName()
      
      const roomRef = doc(db, 'rooms', room.id)
      await updateDoc(roomRef, {
        participants: arrayUnion({
          name: finalName,
          joinedAt: serverTimestamp(),
          deviceType: deviceInfo.isMobile ? 'mobile' : deviceInfo.isTablet ? 'tablet' : 'desktop'
        })
      })

      // Redirigir a la sala
      window.location.href = `/room/${room.id}?participant=${encodeURIComponent(finalName)}`
      
    } catch (error) {
      console.error('Error joining room:', error)
      toast.error('Error al unirse a la sala')
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
              {loading && participant.code.length >= 4 && (
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
                    room.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            )}

            {/* Input de nombre (opcional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu Nombre (opcional)
              </label>
              <input
                type="text"
                value={participant.name}
                onChange={handleNameChange}
                placeholder="Si no ingresas, se asignará automáticamente"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                style={{ fontSize: '16px' }}
              />
              <p className="mt-1 text-xs text-gray-500">
                💡 Si lo dejas vacío, te asignaremos un nombre genial automáticamente
              </p>
            </div>

            {/* Botón de unirse */}
            <button
              onClick={handleJoinRoom}
              disabled={!room || isJoining || room?.status !== 'active'}
              className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 ${
                room && room.status === 'active' && !isJoining
                  ? 'bg-primary-600 text-white hover:bg-primary-700 transform hover:scale-105 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uniéndose...
                </div>
              ) : room && room.status === 'active' ? (
                '🚀 Unirse a la Sala'
              ) : room && room.status !== 'active' ? (
                '⏸️ Sala Inactiva'
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
