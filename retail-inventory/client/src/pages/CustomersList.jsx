import React, { useEffect, useState } from 'react'
import api from '../api'
import DataTable from '../components/ui/DataTable'
import { useNavigate } from 'react-router-dom'

export default function CustomersList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.customers.getAll().then((res) => { setData(res.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' }
  ]

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Customers</h3>
      </div>
      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/customers/${r._id}`)} />
    </div>
  )
}
