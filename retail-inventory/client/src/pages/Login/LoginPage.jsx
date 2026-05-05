import React, { useState } from 'react'
import { Box, Lock, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login({ username, password })
      if (result?.token && result?.user) {
        toast.success('Welcome back!')
        navigate('/')
      }
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-black/30 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-cyan-500 via-cyan-600 to-slate-950 p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.4),transparent_45%)]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Box className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-cyan-100">Retail Inventory</div>
                  <h1 className="text-3xl font-semibold">RetailIQ</h1>
                </div>
              </div>

              <div className="mt-12 space-y-4 max-w-md">
                <h2 className="text-4xl font-semibold leading-tight text-white">Inventory, sales, and restock operations in one place.</h2>
                <p className="text-sm leading-6 text-cyan-50/90">Manage products, suppliers, customers, orders, and reporting from a clean retail dashboard built for fast workflows.</p>
              </div>
            </div>

            <div className="relative mt-10 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm font-medium text-cyan-50">Demo credentials</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-100">Admin</div>
                  <div className="mt-1 font-semibold text-white">admin / admin123</div>
                </div>
                <div className="rounded-2xl bg-slate-950/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-100">Staff</div>
                  <div className="mt-1 font-semibold text-white">staff1 / staff123</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-900 p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-xl shadow-black/20">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Sign in</div>
                <h2 className="mt-2 text-3xl font-semibold text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-400">Use your inventory management credentials to continue.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                      placeholder="Enter password"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
