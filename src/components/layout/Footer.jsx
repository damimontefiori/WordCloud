import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-6 h-6 bg-primary-600 rounded mr-2 flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="text-gray-600 text-sm">
              WordCloud App - Sesiones colaborativas en tiempo real
            </span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>© {currentYear} WordCloud App</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              GitHub
            </a>
            <a 
              href="/docs" 
              className="hover:text-gray-700 transition-colors"
            >
              Documentación
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
