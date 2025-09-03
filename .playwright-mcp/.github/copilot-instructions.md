# GitHub Copilot Instructions

## Project Overview
- **WordCloud Web App** - Real-time word cloud generation
- **Tech Stack**: React 18 + Vite + Firebase + Tailwind CSS
- **Architecture**: Client-side only, NO Firebase Functions (Spark plan)
- **Hosting**: Netlify (free tier)

## Code Preferences

### Framework & Tools
- React 18 with hooks (useState, useEffect, useContext)
- Vite for bundling and dev server
- Tailwind CSS for styling (mobile-first)
- Firebase Firestore + Auth (Spark plan only)
- JavaScript (not TypeScript)

### Architecture Rules
- NO Firebase Functions (use direct Firestore operations)
- Context API for global state
- Component-based architecture
- Mobile-first responsive design
- Client-side only operations

### Naming Conventions
- camelCase for variables/functions: `handleCreateRoom`
- PascalCase for components: `Dashboard`
- Descriptive file names: `deleteRoom.js`, `geekNames.js`

### React Patterns
```jsx
// Preferred state management
const [isLoading, setIsLoading] = useState(false)

// Event handlers
const handleSubmit = async (e) => {
  e.preventDefault()
  // logic
}

// Conditional rendering
{isAdmin && <AdminButton />}

//Versionado
Genera una numero de version con cada push a github y muestra la version en la interfaz de usuario

//Comentarios en Codigo
Genera comentarios claros y concisos en el código para explicar la lógica y las decisiones de implementación.

//Integración Continua
Con cada cambio implementado en el código, se deben ejecutar pruebas automatizadas para validar la funcionalidad y estabilidad de la aplicación. Utiliza Playwright para realizar pruebas end-to-end, asegurando que los flujos principales funcionen correctamente antes de realizar cualquier despliegue.

//Despliegue Continuo
Completado el proceso de integración continua, sube el codigo a GitHub, esto hara que el codigo se despliegue automaticamente en Netlify.

// Integración Continua  
Cada vez que se realicen agreguen funcionalidades nuevas y se arreglen bugs en el código, deberán ejecutarse pruebas automatizadas para validar la funcionalidad y la estabilidad de la aplicación. Se recomienda utilizar **Playwright** para llevar a cabo pruebas end-to-end, garantizando que los flujos principales funcionen correctamente antes de proceder con cualquier despliegue.  

// Despliegue Continuo  
Una vez completado el proceso de integración continua, el código se subirá automáticamente a **GitHub**, lo que desencadenará el despliegue en **Netlify** sin intervención manual.  Se agregaran comentarios al push para indicar la versión y los cambios realizados.
