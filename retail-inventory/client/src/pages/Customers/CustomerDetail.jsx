import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const shortId = (id) => (id ? id.slice(-6).toUpperCase() : '—')

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [customerRes, ordersRes] = await Promise.all([
        api.customers.getById(id),
        api.customers.getOrders(id)
      ])

      setCustomer(customerRes.data || customerRes)
      const response = ordersRes
      setOrders(response.orders || response.data?.orders || response.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const totalSpend = orders.reduce((sum, order) => sum + Number(order.total_amt || 0), 0)
    const lastOrderDate = orders[0]?.order_date
    return { totalOrders, totalSpend, lastOrderDate }
  }, [orders])

  const orderColumns = [
    { key: '_id', header: 'Order ID', render: (_, row) => shortId(row._id) },
    { key: 'customer', header: 'Customer', render: (customerValue) => customerValue?.name || '—' },
    { key: 'order_date', header: 'Date', render: (value) => formatDate(value) },
    { key: 'items', header: 'Items Count', render: (items) => (items || []).length },
    { key: 'total_amt', header: 'Total (₹)', render: (value) => formatCurrency(value) },
    { key: 'payment_mode', header: 'Payment Mode' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const color = value === 'Completed' ? 'green' : value === 'Cancelled' ? 'red' : 'yellow'
        return <Badge text={value} color={color} />
      }
    }
  ]

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading customer…</div>
  }

  if (!customer) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">Customer not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Customers</p>
        <h1 className="mt-2 text-3xl font-semibold">Customer Profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="text-base font-semibold text-slate-950">{customer.name}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-950">{customer.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-950">{customer.email || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium text-slate-950">{customer.address || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Member Since</p>
                <p className="font-medium text-slate-950">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <StatCard title="Total Orders" value={stats.totalOrders} subtitle="All time purchases" color="blue" />
            <StatCard title="Total Spend" value={formatCurrency(stats.totalSpend)} subtitle="Lifetime value" color="green" />
            <StatCard title="Last Order Date" value={formatDate(stats.lastOrderDate)} subtitle="Most recent purchase" color="yellow" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Order History</h2>
            <p className="text-sm text-slate-500">All orders placed by this customer.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={orderColumns}
              data={orders}
              loading={false}
              onRowClick={(row) => navigate(`/orders/${row._id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
