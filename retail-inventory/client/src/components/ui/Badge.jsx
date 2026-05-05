import React from 'react'

const colorClasses = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800'
}

export default function Badge({ text, color = 'gray' }) {
  return <span className={`px-2 py-1 text-xs rounded-full ${colorClasses[color]}`}>{text}</span>
}
