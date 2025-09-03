import React from 'react'

const PersonalBadge = () => {
  return (
    <div 
      className="personal-badge"
      role="note"
      aria-label="Marca personal en header"
    >
      <span>
        Sitio desarrollado por Damian Montefiori — 
      </span>
      <a
        href="https://www.linkedin.com/in/damian-montefiori"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline transition-colors"
      >
        LinkedIn
      </a>
    </div>
  )
}

export default PersonalBadge
