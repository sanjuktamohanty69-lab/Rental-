import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.customers.getById(id).then((r) => setCustomer(r.data)).catch(() => {})
    api.customers.getOrders(id).then((r) => { setOrders(r.orders || r.data?.orders || []) }).catch(() => {})
  }, [id])

  if (!customer) return <div>Loading...</div>

  return (
    <div>
      <h3 className="text-lg font-semibold">{customer.name}</h3>
      <p className="text-sm text-gray-600">{customer.phone} • {customer.email}</p>
      <div className="mt-4">
        <h4 className="font-medium">Order History</h4>
        <ul className="list-disc ml-6 mt-2">
          {orders.map((o) => (
            <li key={o._id}>{o._id} — ${o.total_amt}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
