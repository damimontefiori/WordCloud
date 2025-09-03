import { useState, useEffect } from 'react'

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'desktop',
    orientation: 'landscape'
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Detectar móviles
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                      (window.innerWidth <= 768)
      
      // Detectar tablets
      const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth >= 768 && window.innerWidth <= 1024
      
      // Detectar orientación
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      
      // Determinar tamaño de pantalla
      let screenSize = 'desktop'
      if (window.innerWidth <= 480) screenSize = 'mobile'
      else if (window.innerWidth <= 768) screenSize = 'tablet'
      else if (window.innerWidth <= 1024) screenSize = 'tablet-large'
      
      setDeviceInfo({
        isMobile: isMobile && !isTablet,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        isTouchDevice,
        screenSize,
        orientation
      })
    }

    // Detectar al cargar
    detectDevice()

    // Detectar cambios de tamaño de ventana y orientación
    const handleResize = () => detectDevice()
    const handleOrientationChange = () => {
      // Pequeño delay para que la orientación se aplique completamente
      setTimeout(detectDevice, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return deviceInfo
}

export default useDeviceDetection
