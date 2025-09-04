import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Crea
            <span className="text-primary-600"> Word Clouds </span>
            Colaborativos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Involucra a tu audiencia con sesiones interactivas de Word Cloud en tiempo real. 
            Ideal para educación, presentaciones y dinámicas grupales.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
                  Ir al Dashboard
                </Link>
                <Link to="/join" className="btn bg-primary-500 hover:bg-primary-600 text-white border-primary-500 hover:border-primary-600 text-lg px-8 py-3">
                  Unirme a sala de otro presentador
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
                  Crear mi primera sala
                </Link>
                <Link to="/join" className="btn btn-secondary text-lg px-8 py-3">
                  Unirse a una sala
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir WordCloud App?
            </h2>
            <p className="text-lg text-gray-600">
              Características diseñadas para maximizar la participación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tiempo Real</h3>
              <p className="text-gray-600">
                Las palabras aparecen instantáneamente en el Word Cloud conforme los participantes las envían.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin Registros</h3>
              <p className="text-gray-600">
                Los participantes pueden unirse inmediatamente con solo un código, sin crear cuentas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fácil de Usar</h3>
              <p className="text-gray-600">
                Interfaz intuitiva que funciona en cualquier dispositivo, desde móviles hasta proyectores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cómo funciona
            </h2>
            <p className="text-lg text-gray-600">
              En 3 simples pasos puedes tener tu Word Cloud funcionando
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crea una sala</h3>
              <p className="text-gray-600">
                Regístrate y crea una nueva sala con el título de tu preferencia.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparte el código</h3>
              <p className="text-gray-600">
                Comparte el código de 6 caracteres con tus participantes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Disfruta los resultados!</h3>
              <p className="text-gray-600">
                Ve el Word Cloud actualizarse en tiempo real mientras participan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Crea tu primera sala colaborativa en menos de 2 minutos
          </p>
          {!currentUser && (
            <Link to="/login" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
              Comenzar Gratis
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
