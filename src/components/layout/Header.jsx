import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import AboutModal from '../AboutModal'
import PersonalBadge from '../PersonalBadge'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
      navigate('/')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Badge Personal */}
          <div className="flex-shrink-0 flex items-center min-w-0">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg mr-2 sm:mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900 truncate">WordCloud</span>
            </Link>
            <div className="hidden sm:block">
              <PersonalBadge />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`${
                isActive('/') 
                  ? 'text-primary-600 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Inicio
            </Link>
            
            {currentUser && (
              <Link 
                to="/dashboard" 
                className={`${
                  isActive('/dashboard') 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Dashboard
              </Link>
            )}

            {/* Botón About - siempre visible */}
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            >
              About
            </button>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                <span className="text-xs sm:text-sm text-gray-700 truncate max-w-32 sm:max-w-none">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-xs sm:text-sm whitespace-nowrap"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link to="/join" className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                  Unirse a sala
                </Link>
                <Link to="/login" className="btn btn-primary text-xs sm:text-sm whitespace-nowrap">
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal About */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
    </header>
  )
}

export default Header
