import React, { useEffect, useState } from 'react'
import api from '../api'
import DataTable from '../components/ui/DataTable'
import { useNavigate } from 'react-router-dom'

export default function SuppliersList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.suppliers.getAll().then((res) => { setData(res.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'contact', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'city', header: 'City' }
  ]

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Suppliers</h3>
        <button onClick={() => navigate('/suppliers/new')} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/suppliers/${r._id}`)} />
    </div>
  )
}
