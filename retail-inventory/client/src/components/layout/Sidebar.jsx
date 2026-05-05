import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Box, Users, ShoppingCart, Repeat, BarChart2, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/products', label: 'Products', icon: Box },
  { to: '/suppliers', label: 'Suppliers', icon: Users },
  { to: '/customers', label: 'Customers', icon: ShoppingCart },
  { to: '/orders', label: 'Orders', icon: Repeat },
  { to: '/restock', label: 'Restock', icon: ShoppingCart },
  { to: '/reports', label: 'Reports', icon: BarChart2 }
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div>
      <div className="md:hidden p-2 bg-[#0f1724] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6" onClick={() => setOpen(!open)} />
          <span className="font-bold">RetailIQ</span>
        </div>
      </div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#1e293b] text-white transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform`}>
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Box className="w-6 h-6 text-white" />
              <span className="text-lg font-bold">RetailIQ</span>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center gap-3 p-2 rounded-md hover:bg-slate-700 ${isActive ? 'bg-slate-700 font-semibold' : ''}`}>
                  <l.icon className="w-5 h-5" />
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-6 p-2 border-t border-slate-700">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-slate-300 capitalize">{user.role}</div>
                </div>
                <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
              </div>
            ) : (
              <div className="text-slate-300">Not signed in</div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
