import React from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-3xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded shadow p-4 ${sizeMap[size]} w-full mx-4`}> 
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
