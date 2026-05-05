import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Package, ShoppingBag, ShoppingCart, RefreshCcw, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import api from '../api'
import StatCard from '../components/ui/StatCard'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const startOfDay = (date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const formatDateKey = (date) => date.toISOString().slice(0, 10)

const buildLast7Days = () => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        Loading dashboard…
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [salesSummary, setSalesSummary] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [inventoryStatus, setInventoryStatus] = useState(null)

  const { start, end } = useMemo(buildLast7Days, [])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const [lowStockRes, salesRes, topRes, inventoryRes] = await Promise.all([
          api.products.getLowStock(),
          api.reports.salesSummary({ startDate: start.toISOString(), endDate: end.toISOString() }),
          api.reports.topProducts({ limit: 5, startDate: start.toISOString(), endDate: end.toISOString() }),
          api.reports.inventoryStatus()
        ])

        if (!mounted) return

        setLowStockProducts(lowStockRes?.data || [])
        setSalesSummary(salesRes || null)
        setTopProducts(topRes || [])
        setInventoryStatus(inventoryRes || null)
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load dashboard data'
        if (mounted) {
          setError(message)
          toast.error(message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [start, end])

  const dailyRevenue = useMemo(() => {
    const days = salesSummary?.daily || []
    return days.map((day) => ({
      date: day._id,
      revenue: Number(day.totalRevenue || 0),
      orders: Number(day.orderCount || 0)
    }))
  }, [salesSummary])

  const todayKey = formatDateKey(new Date())
  const todayEntry = dailyRevenue.find((item) => item.date === todayKey)
  const todayRevenue = todayEntry?.revenue || 0
  const totalOrdersToday = todayEntry?.orders || 0

  const totalProducts = inventoryStatus?.summary?.totalProducts || inventoryStatus?.allProducts?.length || 0
  const lowStockCount = inventoryStatus?.summary?.lowStockCount ?? lowStockProducts.length

  const topProductsTableData = useMemo(() => (topProducts || []).map((row) => ({
    product: row.product?.name || '—',
    category: row.product?.category || '—',
    units_sold: row.units_sold || 0,
    total_revenue: row.total_revenue || 0
  })), [topProducts])

  const topColumns = [
    { key: 'product', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'units_sold', header: 'Units Sold' },
    { key: 'total_revenue', header: 'Revenue', render: (value) => formatMoney(value) }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Retail Inventory</p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Live overview of stock, sales, and the highest-impact products across the last 7 days.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/restock')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Manage Restock
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Products"
              value={totalProducts}
              subtitle="Inventory count"
              icon={<Package className="h-5 w-5 text-cyan-500" />}
              color="blue"
            />
            <StatCard
              title="Low Stock Items"
              value={lowStockCount}
              subtitle="Needs attention"
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              color="red"
            />
            <StatCard
              title="Today's Revenue"
              value={formatMoney(todayRevenue)}
              subtitle="Last 7 days summary"
              icon={<ShoppingBag className="h-5 w-5 text-emerald-500" />}
              color="green"
            />
            <StatCard
              title="Total Orders Today"
              value={totalOrdersToday}
              subtitle="Completed orders"
              icon={<ShoppingCart className="h-5 w-5 text-amber-500" />}
              color="yellow"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Daily Revenue</h2>
                  <p className="text-sm text-slate-500">Revenue for the last 7 days in ₹</p>
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}
                      formatter={(value) => formatMoney(value)}
                    />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Top 5 Products</h2>
                <p className="text-sm text-slate-500">Best performers in the selected period</p>
              </div>
              <DataTable columns={topColumns} data={topProductsTableData} loading={false} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h2>
                <p className="text-sm text-slate-500">Items at or below reorder level</p>
              </div>
              <Badge text={`${lowStockProducts.length} alerts`} color="red" />
            </div>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  No low stock alerts right now.
                </div>
              ) : (
                lowStockProducts.map((product) => {
                  const isOut = Number(product.stock_qty || 0) <= 0
                  return (
                    <div key={product._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{product.name}</div>
                        <div className="text-sm text-slate-500">{product.category}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          {Number(product.stock_qty || 0)} / {Number(product.reorder_lvl || 0)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge text={isOut ? 'OUT OF STOCK' : 'LOW STOCK'} color={isOut ? 'red' : 'yellow'} />
                        <button
                          type="button"
                          onClick={() => navigate(`/restock?product=${product._id}`)}
                          className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
