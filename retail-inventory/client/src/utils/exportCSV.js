function escapeCSVValue(value) {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function exportToCSV(filename, columns, data) {
  const headers = columns.map((column) => escapeCSVValue(column.header))
  const rows = data.map((row) => columns.map((column) => {
    const value = typeof column.accessor === 'function' ? column.accessor(row) : row?.[column.key]
    return escapeCSVValue(value)
  }))

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default exportToCSV
