import React, { useEffect, useState } from 'react'
import api from '../api'
import DataTable from '../components/ui/DataTable'

export default function Restock() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.restock.getAll().then((r) => { setData(r.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'product', header: 'Product', render: (v) => v?.name },
    { key: 'supplier', header: 'Supplier', render: (v) => v?.name },
    { key: 'qty_added', header: 'Qty' },
    { key: 'date', header: 'Date', render: (v) => new Date(v).toLocaleString() }
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Restock</h3>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  )
}
