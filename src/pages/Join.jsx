import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebase } from '../contexts/FirebaseContext'
import toast from 'react-hot-toast'

const Join = () => {
  const [roomCode, setRoomCode] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { api } = useFirebase()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!roomCode.trim()) {
      return toast.error('Por favor ingresa un código de sala')
    }

    if (roomCode.length !== 6) {
      return toast.error('El código debe tener 6 caracteres')
    }

    if (!participantName.trim()) {
      return toast.error('Por favor ingresa tu nombre')
    }

    setLoading(true)
    try {
      // Try to join the room using the API (with Functions fallback to Firestore)
      const result = await api.joinRoom({
        roomCode: roomCode.toUpperCase(),
        participantName: participantName.trim()
      })
      
      console.log('🎉 Successfully joined room:', result)
      
      // Save participant info to localStorage
      const participantInfo = {
        id: result.data.participantId,
        name: participantName.trim(),
        roomCode: roomCode.toUpperCase(),
        roomId: result.data.roomId,
        joinedAt: new Date().toISOString()
      }
      
      localStorage.setItem('participant', JSON.stringify(participantInfo))
      
      console.log('💾 Participant info saved:', participantInfo)
      
      // Show success message
      toast.success(`¡Te has unido a la sala ${roomCode.toUpperCase()}!`)
      
      // Navigate to the room
      navigate(`/room/${roomCode.toUpperCase()}`)
      
    } catch (error) {
      console.error('Error joining room:', error)
      toast.error(error.message || 'Error al unirse a la sala')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      setRoomCode(value)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-lg mr-3 flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">WordCloud</span>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900">
            Unirse a una sala
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa el código de 6 caracteres que te proporcionó el presentador
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="participantName" className="block text-sm font-medium text-gray-700 mb-2">
                Tu nombre
              </label>
              <input
                id="participantName"
                name="participantName"
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="input"
                placeholder="Escribe tu nombre"
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                Código de la sala
              </label>
              <input
                id="roomCode"
                name="roomCode"
                type="text"
                required
                value={roomCode}
                onChange={handleCodeChange}
                className="input text-center text-2xl font-mono tracking-widest"
                placeholder="ABC123"
                maxLength={6}
              />
              <p className="mt-2 text-xs text-gray-500">
                Ejemplo: ABC123, XYZ789
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || roomCode.length !== 6 || !participantName.trim()}
              className={`w-full btn btn-primary py-3 ${
                loading || roomCode.length !== 6 || !participantName.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uniéndose a la sala...
                </div>
              ) : (
                'Unirse a la sala'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Eres presentador?{' '}
              <a
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Inicia sesión para crear salas
              </a>
            </p>
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  ¿Cómo funciona?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Ingresa el código que te dio el presentador</li>
                    <li>Escribe tu nombre (opcional)</li>
                    <li>Envía una palabra para el Word Cloud</li>
                    <li>¡Ve los resultados en tiempo real!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join
