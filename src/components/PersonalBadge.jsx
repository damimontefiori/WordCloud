import React from 'react'

const PersonalBadge = () => {
  return (
    <div 
      className="personal-badge"
      role="note"
      aria-label="Marca personal en header"
    >
      <span className="text-gray-300">
        Sitio desarrollado por Damian Montefiori — 
      </span>
      <a
        href="https://www.linkedin.com/in/damian-montefiori"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 hover:text-blue-200 underline transition-colors"
      >
        LinkedIn
      </a>
    </div>
  )
}

export default PersonalBadge
