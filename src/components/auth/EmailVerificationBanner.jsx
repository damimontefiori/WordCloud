import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const EmailVerificationBanner = () => {
  const { currentUser, sendVerificationEmail } = useAuth()
  const [isResending, setIsResending] = useState(false)

  // Don't show banner if user is verified or not logged in
  if (!currentUser || currentUser.emailVerified) {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await sendVerificationEmail()
      toast.success('Email de verificación enviado. Revisa tu bandeja de entrada.')
    } catch (error) {
      console.error('Error resending verification email:', error)
      if (error.code === 'auth/too-many-requests') {
        toast.error('Demasiados intentos. Espera unos minutos antes de intentar de nuevo.')
      } else {
        toast.error('Error al enviar email de verificación')
      }
    } finally {
      setIsResending(false)
    }
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🚨 Verifica tu dirección de email para acceso completo
          </h3>
          <div className="text-yellow-700 space-y-3">
            <p className="font-medium">
              Hemos enviado un email de verificación a <strong>{currentUser.email}</strong>
            </p>
            
            <div className="bg-yellow-100 rounded-md p-3">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Pasos a seguir:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Revisa tu bandeja de entrada (y carpeta de spam)</li>
                <li>Haz clic en el enlace "Verificar email"</li>
                <li>Regresa aquí y haz clic en "Ya verifiqué mi email"</li>
              </ol>
            </div>
            
            <p className="text-sm">
              <strong>Funcionalidad limitada:</strong> No podrás crear salas hasta verificar tu email.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300 px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
            >
              {isResending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800 mr-2"></div>
                  Enviando...
                </div>
              ) : (
                '📧 Reenviar email'
              )}
            </button>
            <button
              type="button"
              onClick={handleReload}
              className="bg-green-200 text-green-800 hover:bg-green-300 px-4 py-2 rounded-md font-medium transition-colors"
            >
              ✅ Ya verifiqué mi email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationBanner
