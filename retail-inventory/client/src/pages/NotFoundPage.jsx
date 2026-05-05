import React from 'react'
import { ArrowLeft, SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
          <SearchX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">The page you requested does not exist. Use the button below to go back to the dashboard.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
