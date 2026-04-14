import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { useAuth } from '../contexts/AuthContext'
import { useFirebase } from '../contexts/FirebaseContext'
import { deleteRoom } from '../services/deleteRoom'
import { ROOM_TYPES, ESTIMATION_SCALES } from '../utils/constants'
import EmailVerificationBanner from '../components/auth/EmailVerificationBanner'
import GuideModal from '../components/GuideModal'
import ShareModal from '../components/ShareModal'

const Dashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { api, db, subscribeToParticipants } = useFirebase()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [createRoomLoading, setCreateRoomLoading] = useState(false)
  const [actingOn, setActingOn] = useState(null)
  const [error, setError] = useState('')
  const [participantCounts, setParticipantCounts] = useState({})
  
  // Estados para el modal de crear sala
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [roomTitle, setRoomTitle] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [startAfterCreation, setStartAfterCreation] = useState(false)
  const [roomType, setRoomType] = useState(ROOM_TYPES.WORDCLOUD)
  const [estimationScale, setEstimationScale] = useState('FIBONACCI')
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)
  
  // Estados para los modales de guía y compartir
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    loadUserRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  // Subscribe to participants for all user rooms
  useEffect(() => {
    if (!rooms.length) return

    const unsubscribers = []
    
    rooms.forEach(room => {
      const unsubscribe = subscribeToParticipants(room.id, (snapshot) => {
        const count = snapshot.size
        setParticipantCounts(prev => ({
          ...prev,
          [room.id]: count
        }))
      })
      unsubscribers.push(unsubscribe)
    })

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [rooms, subscribeToParticipants])

  const loadUserRooms = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const roomsRef = collection(db, 'rooms')
      const q = query(
        roomsRef,
        where('createdBy', '==', currentUser.uid)
        // TODO: Add orderBy after creating composite index in Firestore
        // orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      let userRooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort in memory as temporary workaround
      userRooms = userRooms.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0))
      setRooms(userRooms)
    } catch (err) {
      setError('Error al cargar las salas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!currentUser) return
    
    // Check if email is verified
    if (!currentUser.emailVerified) {
      toast.error('Debes verificar tu email antes de crear una sala')
      return
    }
    
    setCreateRoomLoading(true)
    setError('')
    try {
      const roomData = {
        title: roomTitle.trim() || `Sala de ${currentUser.email}`,
        description: roomDescription.trim() || (roomType === ROOM_TYPES.PLANNING_POKER ? 'Sesión de Planning Poker' : 'Nueva sala de Word Cloud'),
        maxParticipants: 50,
        timeLimit: 30,
        adminEmail: currentUser.email,
        isActive: startAfterCreation,
        state: startAfterCreation ? 'active' : 'waiting',
        roomType,
        estimationScale: roomType === ROOM_TYPES.PLANNING_POKER ? estimationScale : null
      }
      const result = await api.createRoom(roomData)
      await loadUserRooms()
      
      // Limpiar el modal
      setRoomTitle('')
      setRoomDescription('')
      setStartAfterCreation(false)
      setRoomType(ROOM_TYPES.WORDCLOUD)
      setEstimationScale('FIBONACCI')
      setShowCreateModal(false)
      
      const roomCode = result?.data?.roomCode || result?.roomCode
      if (roomCode) navigate(`/room/${roomCode}`)
    } catch (err) {
      setError(err.message || 'Error al crear la sala')
      toast.error(err.message || 'Error al crear la sala')
    } finally {
      setCreateRoomLoading(false)
    }
  }

  const handleStartRoom = async (roomId) => {
    try {
      setActingOn(roomId)
      await api.startRoom(roomId)
      toast.success('Sala iniciada')
      await loadUserRooms()
    } catch (e) {
      toast.error(e.message || 'No se pudo iniciar la sala')
    } finally {
      setActingOn(null)
    }
  }

  const handleEndRoom = async (roomId) => {
    try {
      setActingOn(roomId)
      await api.endRoom(roomId)
      toast.success('Sala finalizada')
      await loadUserRooms()
    } catch (e) {
      toast.error(e.message || 'No se pudo finalizar la sala')
    } finally {
      setActingOn(null)
    }
  }

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    try {
      setActingOn(roomToDelete.id)
      console.log('�️ Eliminando sala usando función importada directamente:', roomToDelete.id)
      const result = await deleteRoom(roomToDelete.id)
      
      // Show success message with details
      const { deletedCounts } = result
      const message = `Sala "${roomToDelete.title}" eliminada. Datos eliminados: ${deletedCounts.participants} participantes, ${deletedCounts.words} palabras.`
      toast.success(message)
      
      await loadUserRooms()
      setShowDeleteModal(false)
      setRoomToDelete(null)
    } catch (e) {
      toast.error(e.message || 'No se pudo eliminar la sala')
    } finally {
      setActingOn(null)
    }
  }

  const confirmDeleteRoom = (room) => {
    setRoomToDelete(room)
    setShowDeleteModal(true)
  }

  const handleCopyLink = (roomCode) => {
    const link = `${window.location.origin}/join?code=${roomCode}`
    navigator.clipboard.writeText(link).then(() => {
      toast.success('¡Link copiado al portapapeles!')
    }).catch(() => {
      toast.error('Error al copiar el link')
    })
  }

  const activeRooms = rooms.filter((r) => r.state === 'active' || r.state === 'waiting').length
  const totalParticipants = Object.values(participantCounts).reduce((total, count) => total + count, 0)
  const totalRoomsWithParticipants = Object.values(participantCounts).filter(count => count > 0).length
  
  // Separar participantes por estado de sala
  const activeAndWaitingRooms = rooms.filter(r => r.state === 'active' || r.state === 'waiting')
  const finishedRooms = rooms.filter(r => r.state === 'ended' || r.state === 'finished')
  
  const participantsInActiveRooms = activeAndWaitingRooms.reduce((total, room) => {
    return total + (participantCounts[room.id] || 0)
  }, 0)
  
  const participantsInFinishedRooms = finishedRooms.reduce((total, room) => {
    return total + (participantCounts[room.id] || 0)
  }, 0)
  
  const activeRoomsCount = activeAndWaitingRooms.length
  const finishedRoomsCount = finishedRooms.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {currentUser?.email}. Gestiona tus salas de Word Cloud desde aquí.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crear Nueva Sala</h3>
              <p className="text-gray-600 text-sm mb-4">Inicia una nueva sesión de Word Cloud</p>
              <button 
                className={`btn w-full ${currentUser?.emailVerified ? 'btn-primary' : 'btn-secondary opacity-60'}`} 
                onClick={() => setShowCreateModal(true)} 
                disabled={createRoomLoading || !currentUser?.emailVerified}
                title={!currentUser?.emailVerified ? 'Verifica tu email para crear salas' : ''}
              >
                {!currentUser?.emailVerified ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Crear Sala
                  </div>
                ) : (
                  'Crear Sala'
                )}
              </button>
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
              <div className="space-y-1">
                {participantsInActiveRooms > 0 && (
                  <p className="text-green-600 text-sm font-medium">
                    {participantsInActiveRooms} en {activeRoomsCount} salas activas
                  </p>
                )}
                {participantsInFinishedRooms > 0 && (
                  <p className="text-gray-600 text-sm">
                    {participantsInFinishedRooms} en {finishedRoomsCount} salas finalizadas
                  </p>
                )}
                {totalParticipants === 0 && (
                  <p className="text-gray-600 text-sm">Total Participantes</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeRooms}</h3>
              <p className="text-gray-600 text-sm">Salas activas (incluye en espera)</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mis Salas</h2>
            <div className="flex space-x-3">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} disabled={createRoomLoading}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Sala
              </button>
            </div>
          </div>

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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes salas creadas</h3>
              <p className="text-gray-600 mb-6">Crea tu primera sala para comenzar a interactuar con tu audiencia</p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} disabled={createRoomLoading}>
                Crear Mi Primera Sala
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{room.title}</h3>
                      <p className="text-gray-600 text-sm">{room.description}</p>
                      <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-2">
                        <span>Código: {room.code}</span>
                        <span>Participantes: {participantCounts[room.id] || 0}</span>
                        {room.roomType === 'planning-poker' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                            🃏 Poker
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          room.state === 'active' ? 'bg-green-100 text-green-800' :
                          room.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.state === 'active' ? 'Activa' : room.state === 'waiting' ? 'Esperando' : 'Finalizada'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                      <button className="btn btn-secondary btn-sm flex-1 lg:flex-initial" onClick={() => navigate(`/room/${room.code}`)}>
                        Ver Sala
                      </button>
                      <button 
                        className="btn btn-primary btn-sm flex-1 lg:flex-initial" 
                        onClick={() => handleCopyLink(room.code)}
                        title="Copiar link para invitar participantes"
                      >
                        📋 Copiar Link
                      </button>
                      {room.state !== 'active' && (
                        <button className="btn btn-success btn-sm flex-1 lg:flex-initial" onClick={() => handleStartRoom(room.id)} disabled={actingOn === room.id}>
                          {actingOn === room.id ? 'Procesando…' : 'Iniciar'}
                        </button>
                      )}
                      {room.state !== 'ended' && (
                        <button className="btn btn-warning btn-sm flex-1 lg:flex-initial" onClick={() => handleEndRoom(room.id)} disabled={actingOn === room.id}>
                          {actingOn === room.id ? 'Procesando…' : 'Finalizar'}
                        </button>
                      )}
                      <button 
                        className="btn btn-danger btn-sm flex-1 lg:flex-initial" 
                        onClick={() => confirmDeleteRoom(room)} 
                        disabled={actingOn === room.id}
                        title="Eliminar sala y todos sus datos"
                      >
                        {actingOn === room.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-700 text-sm mb-4">Consulta nuestra guía rápida para crear tu primera sala exitosa.</p>
            <button 
              className="btn bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowGuideModal(true)}
            >
              Ver Guía
            </button>
          </div>
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">¡Comparte la experiencia!</h3>
            <p className="text-green-700 text-sm mb-4">Invita a colegas a usar WordCloud App y mejoren sus presentaciones.</p>
            <button 
              className="btn bg-green-600 text-white hover:bg-green-700"
              onClick={() => setShowShareModal(true)}
            >
              Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Modal para crear sala */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nueva Sala</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la sala (opcional)
                </label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="Ej: Lluvia de ideas Marketing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si lo dejas vacío, usaremos un título por defecto
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="Ej: Sesión de brainstorming para nuevas ideas"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Selector de tipo de sala */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de sala
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRoomType(ROOM_TYPES.WORDCLOUD)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      roomType === ROOM_TYPES.WORDCLOUD
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">☁️</span>
                    <span className="text-sm font-medium">Word Cloud</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomType(ROOM_TYPES.PLANNING_POKER)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      roomType === ROOM_TYPES.PLANNING_POKER
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">🃏</span>
                    <span className="text-sm font-medium">Planning Poker</span>
                  </button>
                </div>
              </div>

              {/* Selector de escala de estimación (solo para Planning Poker) */}
              {roomType === ROOM_TYPES.PLANNING_POKER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escala de estimación
                  </label>
                  <div className="space-y-2">
                    {Object.entries(ESTIMATION_SCALES).map(([key, scale]) => (
                      <label
                        key={key}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          estimationScale === key
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="estimationScale"
                          value={key}
                          checked={estimationScale === key}
                          onChange={(e) => setEstimationScale(e.target.value)}
                          className="w-4 h-4 text-primary-600 mr-3"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">{scale.name}</span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {scale.values.join(' · ')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={startAfterCreation}
                    onChange={(e) => setStartAfterCreation(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Iniciar tras creación
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Si está marcado, la sala se iniciará automáticamente y los participantes podrán enviar palabras inmediatamente
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setRoomTitle('')
                  setRoomDescription('')
                  setStartAfterCreation(false)
                  setRoomType(ROOM_TYPES.WORDCLOUD)
                  setEstimationScale('FIBONACCI')
                  setError('')
                }}
                className="btn btn-secondary flex-1"
                disabled={createRoomLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={createRoomLoading}
                className="btn btn-primary flex-1"
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
        </div>
      )}

      {/* Modal de confirmación para eliminar sala */}
      {showDeleteModal && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                ¿Estás seguro de que quieres eliminar la sala <strong>"{roomToDelete.title}"</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm font-medium mb-2">Se eliminarán permanentemente:</p>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• La sala y toda su configuración</li>
                  <li>• Todos los participantes ({participantCounts[roomToDelete.id] || 0})</li>
                  <li>• Todas las palabras enviadas</li>
                  <li>• Todo el historial de la sala</li>
                </ul>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-gray-600 text-sm">
                  <strong>Código de sala:</strong> {roomToDelete.code}<br/>
                  <strong>Estado:</strong> {roomToDelete.state === 'active' ? 'Activa' : roomToDelete.state === 'waiting' ? 'Esperando' : 'Finalizada'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setRoomToDelete(null)
                }}
                className="btn btn-secondary flex-1"
                disabled={actingOn === roomToDelete.id}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={actingOn === roomToDelete.id}
                className="btn btn-danger flex-1"
              >
                {actingOn === roomToDelete.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Sí, Eliminar Sala'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modales adicionales */}
      <GuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />
      
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
    </div>
  )
}

export default Dashboard
