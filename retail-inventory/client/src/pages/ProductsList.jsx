import React, { useEffect, useState } from 'react'
import DataTable from '../components/ui/DataTable'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function ProductsList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.products.getAll().then((res) => { setData(res.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (v) => `$${v}` },
    { key: 'stock_qty', header: 'Stock' }
  ]

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Products</h3>
        <button onClick={() => navigate('/products/new')} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/products/${r._id}/edit`)} />
    </div>
  )
}
