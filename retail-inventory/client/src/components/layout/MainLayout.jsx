import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Bell } from 'lucide-react'
import api from '../../api'

function titleFromPath(path) {
  if (!path || path === '/') return 'Dashboard'
  const p = path.split('/')[1]
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Dashboard'
}

export default function MainLayout() {
  const location = useLocation()
  const [lowCount, setLowCount] = useState(0)

  useEffect(() => {
    let mounted = true
    api.products.getLowStock().then((res) => {
      if (mounted && res && res.count !== undefined) setLowCount(res.count)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="md:pl-64">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titleFromPath(location.pathname)}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-700" />
              {lowCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded">{lowCount}</span>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
