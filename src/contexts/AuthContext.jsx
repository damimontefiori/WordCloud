import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { useFirebase } from './FirebaseContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { auth } = useFirebase()

  // Sign up function
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // Login function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Logout function
  const logout = () => {
    return signOut(auth)
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [auth])

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner message="Inicializando aplicación..." /> : children}
    </AuthContext.Provider>
  )
}
