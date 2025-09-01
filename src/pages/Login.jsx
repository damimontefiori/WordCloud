import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres')
    }

    setLoading(true)
    try {
      if (isSignUp) {
        await signup(email, password)
        toast.success('Cuenta creada exitosamente')
      } else {
        await login(email, password)
        toast.success('Sesión iniciada exitosamente')
      }
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Auth error:', error)
      if (error.code === 'auth/user-not-found') {
        toast.error('Usuario no encontrado')
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña incorrecta')
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('El email ya está registrado')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido')
      } else {
        toast.error(isSignUp ? 'Error al crear la cuenta' : 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="font-bold text-2xl text-gray-900">WordCloud</span>
        </Link>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {isSignUp ? 'Inicia sesión aquí' : 'Créala aquí'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn btn-primary py-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
                  </div>
                ) : (
                  isSignUp ? 'Crear cuenta' : 'Iniciar sesión'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/join"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Unirse a una sala sin registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
