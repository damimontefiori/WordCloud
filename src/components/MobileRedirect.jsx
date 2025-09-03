import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useDeviceDetection from '../hooks/useDeviceDetection'

const MobileRedirect = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const deviceInfo = useDeviceDetection()

  useEffect(() => {
    // Solo redirigir en la página de Join si es móvil
    if (deviceInfo.isMobile && location.pathname === '/join') {
      // Preservar parámetros de búsqueda
      const searchParams = new URLSearchParams(location.search)
      navigate(`/mobile-join${location.search}`, { replace: true })
    }
  }, [deviceInfo.isMobile, location.pathname, location.search, navigate])

  return children
}

export default MobileRedirect
