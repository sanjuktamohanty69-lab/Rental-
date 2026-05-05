import React from 'react'
import { Inbox } from 'lucide-react'
import EmptyState from './EmptyState'

export default function DataTable({ columns = [], data = [], loading = false, onRowClick }) {
  if (!loading && data.length === 0) {
    return (
      <div className="bg-white p-6">
        <EmptyState
          icon={Inbox}
          title="No data found"
          message="There are no records to display for the current view."
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((c) => (
                  <td key={c.key} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            data.map((row, idx) => (
              <tr key={idx} onClick={() => onRowClick && onRowClick(row)} className="hover:bg-gray-50 cursor-pointer">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
