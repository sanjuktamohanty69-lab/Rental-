import React from 'react'
import Modal from './Modal'

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm">
      <div className="py-4">{message}</div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
        <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Confirm</button>
      </div>
    </Modal>
  )
}
