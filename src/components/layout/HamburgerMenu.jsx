import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AboutModal from '../AboutModal'
import VersionModal from '../VersionModal'

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const location = useLocation()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
  }

  const handleAboutClick = () => {
    setIsAboutModalOpen(true)
    closeMenu()
  }

  const handleVersionClick = () => {
    setIsVersionModalOpen(true)
    closeMenu()
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Abrir menú"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            {/* General Navigation */}
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navegación
              </h3>
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">🏠</span>
                  Inicio
                </Link>
                <button
                  onClick={handleAboutClick}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3">ℹ️</span>
                  Acerca de
                </button>
                <button
                  onClick={handleVersionClick}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3">🏷️</span>
                  Información de Versión
                </button>
              </div>
            </div>

            {/* User Actions */}
            {currentUser ? (
              <div className="px-4 mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Mis Acciones
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">⚙️</span>
                    Gestionar mis salas
                  </Link>
                  <Link
                    to="/join"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/join')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">👥</span>
                    Unirse a sala de otro
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-4 mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Cuenta
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <span className="mr-3">🔑</span>
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          {currentUser && (
            <div className="border-t border-gray-200 p-4">
              <div className="mb-3">
                <p className="text-xs text-gray-500">Conectado como:</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-50 transition-colors"
              >
                <span className="mr-3">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />

      {/* Version Modal */}
      <VersionModal 
        isOpen={isVersionModalOpen} 
        onClose={() => setIsVersionModalOpen(false)} 
      />
    </div>
  )
}

export default HamburgerMenu
