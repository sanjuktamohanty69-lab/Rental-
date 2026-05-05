import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'

const STATUS_OPTIONS = ['All', 'Pending', 'Completed', 'Cancelled']

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const shortId = (id) => (id ? id.slice(-6).toUpperCase() : '—')

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function OrderList() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('All')
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerOptions, setCustomerOptions] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)

  const debouncedCustomerQuery = useDebouncedValue(customerQuery, 400)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (status && status !== 'All') params.status = status
      if (selectedCustomer?._id) params.customerId = selectedCustomer._id

      const res = await api.orders.getAll(params)
      setOrders(res.data || [])
      setPages(res.pages || 1)
      setTotalRevenue(res.totalRevenue || 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, startDate, endDate, status, selectedCustomer?._id])

  useEffect(() => {
    if (!debouncedCustomerQuery || (selectedCustomer && debouncedCustomerQuery.trim().toLowerCase() === `${selectedCustomer.name} • ${selectedCustomer.phone || ''}`.trim().toLowerCase())) {
      setCustomerOptions([])
      return
    }

    let active = true
    const loadCustomers = async () => {
      try {
        const res = await api.customers.getAll({ search: debouncedCustomerQuery })
        if (active) {
          setCustomerOptions(res.data || [])
          setCustomerSearchOpen(true)
        }
      } catch (err) {
        if (active) setCustomerOptions([])
      }
    }

    loadCustomers()
    return () => {
      active = false
    }
  }, [debouncedCustomerQuery])

  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, status, selectedCustomer?._id])

  const columns = useMemo(() => ([
    { key: '_id', header: 'Order ID', render: (_, row) => shortId(row._id) },
    { key: 'customer', header: 'Customer', render: (customer) => customer?.name || '—' },
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
    },
    {
      key: 'action',
      header: 'Action',
      render: (_, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/orders/${row._id}`)
          }}
          className="inline-flex items-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
          aria-label="View order"
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ]), [navigate])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Orders</p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold">Order Management</h1>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">{orders.length} shown</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/orders/new')}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Create Order
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Customer Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value)
                setSelectedCustomer(null)
              }}
              onFocus={() => customerOptions.length > 0 && setCustomerSearchOpen(true)}
              placeholder="Search by customer name or phone"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
            />
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null)
                  setCustomerQuery('')
                  setCustomerOptions([])
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear customer filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {customerSearchOpen && customerOptions.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {customerOptions.map((customer) => (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setCustomerQuery(`${customer.name} • ${customer.phone || ''}`.trim())
                      setCustomerSearchOpen(false)
                    }}
                    className="flex w-full flex-col items-start border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">{customer.name}</span>
                    <span className="text-sm text-slate-500">{customer.phone || 'No phone'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedCustomer && <p className="mt-2 text-xs text-cyan-700">Filtering orders for {selectedCustomer.name}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Status Filter</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${status === option ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Total Revenue for current filter</p>
            <p className="text-3xl font-semibold text-slate-950">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-sm text-slate-500">
            Page {page} of {pages}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          onRowClick={(row) => navigate(`/orders/${row._id}`)}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-sm text-slate-600">Showing 20 per page</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= pages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
