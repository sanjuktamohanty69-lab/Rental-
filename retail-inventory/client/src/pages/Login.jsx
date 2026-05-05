import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ username, password })
      window.location.href = '/'
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Sign in</h2>
        <label className="block mb-2">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <label className="block mb-2">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <button className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Signing...' : 'Sign in'}</button>
      </form>
    </div>
  )
}
