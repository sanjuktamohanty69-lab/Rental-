import React from 'react'

export default function StatCard({ title, value, icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'border-blue-500',
    red: 'border-red-500',
    green: 'border-green-500',
    yellow: 'border-yellow-400',
    gray: 'border-gray-300'
  }
  return (
    <div className={`flex items-center p-4 bg-white rounded shadow-sm border-l-4 ${colorMap[color]}`}>
      {icon && <div className="mr-4">{icon}</div>}
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
      </div>
    </div>
  )
}
