import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await api.orders.getById(id)
      setOrder(res.data || res)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const itemRows = useMemo(() => {
    if (!order?.items) return []
    return order.items.map((item) => ({
      product: item.product?.name || '—',
      category: item.product?.category || '—',
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: Number(item.quantity || 0) * Number(item.unit_price || 0)
    }))
  }, [order])

  const itemColumns = [
    { key: 'product', header: 'Product Name' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Qty' },
    { key: 'unit_price', header: 'Unit Price', render: (value) => formatCurrency(value) },
    { key: 'subtotal', header: 'Subtotal', render: (value) => formatCurrency(value) }
  ]

  const cancelOrder = async () => {
    try {
      await api.orders.updateStatus(id, 'Cancelled')
      toast.success('Order cancelled')
      setConfirmOpen(false)
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading order…</div>
  }

  if (!order) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">Order not found.</div>
  }

  const canCancel = order.status === 'Completed' && user?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Orders</p>
            <h1 className="mt-2 text-3xl font-semibold">Order Detail</h1>
            <p className="mt-2 text-sm text-slate-300">{order._id}</p>
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-xl bg-red-500 px-4 py-2.5 font-medium text-white transition hover:bg-red-400"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Order ID</p>
                <p className="text-base font-semibold text-slate-950">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="text-base font-semibold text-slate-950">{formatDate(order.order_date)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge text={order.status} color={order.status === 'Completed' ? 'green' : order.status === 'Cancelled' ? 'red' : 'yellow'} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment Mode</p>
                <p className="text-base font-semibold text-slate-950">{order.payment_mode}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-medium text-slate-950">{order.customer?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-950">{order.customer?.phone || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium text-slate-950">{order.customer?.address || '—'}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <DataTable columns={itemColumns} data={itemRows} loading={false} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Amount</p>
            <div className="mt-2 text-4xl font-semibold text-slate-950">{formatCurrency(order.total_amt)}</div>
            <p className="mt-2 text-sm text-slate-500 text-right">Amount payable</p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        message="Cancel this completed order? Stock will be restored automatically."
        onConfirm={cancelOrder}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
