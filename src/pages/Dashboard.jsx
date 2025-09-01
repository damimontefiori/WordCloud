import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirebase } from '../contexts/FirebaseContext'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

const Dashboard = () => {
  const { currentUser } = useAuth()
  const { api, db } = useFirebase()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState([])
  const [createRoomLoading, setCreateRoomLoading] = useState(false)
  const [error, setError] = useState('')

  // Load user's rooms on component mount
  useEffect(() => {
    loadUserRooms()
  }, [currentUser])

  const loadUserRooms = async () => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      // Query rooms created by current user - using v9 syntax
      const roomsRef = collection(db, 'rooms')
      const q = query(
        roomsRef,
        where('createdBy', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      const userRooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('Salas cargadas:', userRooms)
      setRooms(userRooms)
    } catch (error) {
      setError('Error al cargar las salas')
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    setCreateRoomLoading(true)
    setError('')
    
    try {
      const roomData = {
        title: `Sala de ${currentUser.email}`,
        description: 'Nueva sala de Word Cloud',
        maxParticipants: 50,
        timeLimit: 30,
        adminEmail: currentUser.email
      }
      
      const result = await api.createRoom(roomData)
      console.log('Sala creada:', result)
      console.log('Room code:', result.data?.roomCode)
      
      // Reload rooms to update the dashboard
      await loadUserRooms()
      
      // Navigate to the room using roomCode from result.data
      navigate(`/room/${result.data.roomCode}`)
      
    } catch (error) {
      setError(error.message || 'Error al crear la sala')
      console.error('Error creating room:', error)
    } finally {
      setCreateRoomLoading(false)
    }
  }

  const activeRooms = rooms.filter(room => room.state === 'active').length
  const totalParticipants = rooms.reduce((total, room) => total + (room.participantCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {currentUser?.email}. Gestiona tus salas de Word Cloud desde aquí.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crear Nueva Sala</h3>
              <p className="text-gray-600 text-sm mb-4">
                Inicia una nueva sesión de Word Cloud
              </p>
              <button 
                className="btn btn-primary w-full"
                onClick={handleCreateRoom}
                disabled={createRoomLoading}
              >
                {createRoomLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </div>
                ) : (
                  'Crear Sala'
                )}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeRooms}</h3>
              <p className="text-gray-600 text-sm">
                Salas Activas
              </p>
            </div>
          </div>

          <div className="card">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{totalParticipants}</h3>
              <p className="text-gray-600 text-sm">
                Total Participantes
              </p>
            </div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mis Salas</h2>
            <div className="flex space-x-3">
              <button className="btn btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtrar
              </button>
              <button className="btn btn-primary" onClick={handleCreateRoom} disabled={createRoomLoading}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Sala
              </button>
            </div>
          </div>

          {/* Empty State or Rooms List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando salas...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes salas creadas
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera sala para comenzar a interactuar con tu audiencia
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateRoom}
                disabled={createRoomLoading}
              >
                {createRoomLoading ? 'Creando...' : 'Crear Mi Primera Sala'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{room.title}</h3>
                      <p className="text-gray-600 text-sm">{room.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="mr-4">Código: {room.code}</span>
                        <span className="mr-4">Participantes: {room.participantCount || 0}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          room.state === 'active' ? 'bg-green-100 text-green-800' :
                          room.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.state === 'active' ? 'Activa' : 
                           room.state === 'waiting' ? 'Esperando' : 'Finalizada'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/room/${room.id}`)}
                      >
                        Ver Sala
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Consulta nuestra guía rápida para crear tu primera sala exitosa.
            </p>
            <button className="btn bg-blue-600 text-white hover:bg-blue-700">
              Ver Guía
            </button>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ¡Comparte la experiencia!
            </h3>
            <p className="text-green-700 text-sm mb-4">
              Invita a colegas a usar WordCloud App y mejoren sus presentaciones.
            </p>
            <button className="btn bg-green-600 text-white hover:bg-green-700">
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
