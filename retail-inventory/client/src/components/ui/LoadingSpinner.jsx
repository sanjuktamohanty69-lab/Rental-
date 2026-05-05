import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <div className="text-sm font-medium">{text}</div>
      </div>
    </div>
  )
}
