import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.orders.getById(id).then((r) => setOrder(r.data)).catch(() => {})
  }, [id])

  if (!order) return <div>Loading...</div>

  return (
    <div>
      <h3 className="text-lg font-semibold">Order {order._id}</h3>
      <p>Customer: {order.customer?.name}</p>
      <p>Total: ${order.total_amt}</p>
      <div className="mt-4">
        <h4 className="font-medium">Items</h4>
        <ul className="list-disc ml-6 mt-2">
          {order.items.map((it) => (
            <li key={it.product?._id || JSON.stringify(it)}>{it.product?.name} x {it.quantity}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
