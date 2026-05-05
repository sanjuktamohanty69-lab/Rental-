import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const AuthStateContext = createContext()
const AuthDispatchContext = createContext()

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false }
    case 'LOGOUT':
      return { ...initialState, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('retail_token')
    const user = localStorage.getItem('retail_user')
    if (token && user) {
      try {
        dispatch({ type: 'LOGIN', payload: { token, user: JSON.parse(user) } })
      } catch (e) {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const res = await api.auth.login(credentials)
    const { token, user } = res
    localStorage.setItem('retail_token', token)
    localStorage.setItem('retail_user', JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { token, user } })
    return res
  }

  const logout = () => {
    try {
      localStorage.removeItem('retail_token')
      localStorage.removeItem('retail_user')
    } catch (e) {}
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={{ login, logout, dispatch }}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
}

export const useAuth = () => {
  const state = useContext(AuthStateContext)
  const actions = useContext(AuthDispatchContext)
  return { ...state, ...actions }
}
