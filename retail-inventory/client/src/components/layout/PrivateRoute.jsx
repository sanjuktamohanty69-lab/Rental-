import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingSpinner text="Checking session..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
