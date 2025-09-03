import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from 'firebase/auth'
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
  const { auth, googleProvider } = useFirebase()

  // Sign up function with email verification
  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Send verification email immediately after account creation
    await sendEmailVerification(userCredential.user)
    return userCredential
  }

  // Send email verification (can be called separately)
  const sendVerificationEmail = () => {
    if (currentUser && !currentUser.emailVerified) {
      return sendEmailVerification(currentUser)
    }
    throw new Error('No user or user already verified')
  }

  // Login function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Google login function
  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider)
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
    loginWithGoogle,
    sendVerificationEmail,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner message="Inicializando aplicación..." /> : children}
    </AuthContext.Provider>
  )
}
