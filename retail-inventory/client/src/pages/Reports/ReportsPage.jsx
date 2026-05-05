import React, { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { exportToCSV } from '../../utils/exportCSV'
import { formatCurrency } from '../../utils/formatters'

const tabs = [
  { key: 'sales', label: 'Sales Summary' },
  { key: 'top-products', label: 'Top Products' },
  { key: 'inventory', label: 'Inventory Status' },
  { key: 'supplier', label: 'Supplier Report' },
  { key: 'customer', label: 'Customer Report' }
]

const COLORS = ['#06b6d4', '#0f172a', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#3b82f6']

const toISODate = (date) => date.toISOString().slice(0, 10)

const lastNDays = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { startDate: toISODate(start), endDate: toISODate(end) }
}

const sevenDayRange = lastNDays(7)

const skeletonBlock = 'animate-pulse rounded-2xl bg-slate-100'

function TabSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`${skeletonBlock} h-28`} />
        ))}
      </div>
      <div className={`${skeletonBlock} h-80`} />
      <div className={`${skeletonBlock} h-72`} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={`${skeletonBlock} h-14`} />
        ))}
      </div>
    </div>
  )
}

function SalesChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-sm text-slate-600">Revenue: {formatCurrency(point?.revenue)}</div>
      <div className="text-sm text-slate-600">Orders: {point?.orders || 0}</div>
    </div>
  )
}

function formatReportDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales')
  const [loadedTabs, setLoadedTabs] = useState({})
  const [tabLoading, setTabLoading] = useState({})
  const [salesRange, setSalesRange] = useState('7')
  const [customSalesRange, setCustomSalesRange] = useState({ startDate: '', endDate: '' })
  const [topLimit, setTopLimit] = useState('5')
  const [salesSummary, setSalesSummary] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [inventoryStatus, setInventoryStatus] = useState(null)
  const [supplierReport, setSupplierReport] = useState([])
  const [customerReport, setCustomerReport] = useState([])
  const [salesDaily, setSalesDaily] = useState([])

  const tabIsLoaded = (key) => Boolean(loadedTabs[key])
  const setLoaded = (key) => setLoadedTabs((current) => ({ ...current, [key]: true }))
  const setLoading = (key, value) => setTabLoading((current) => ({ ...current, [key]: value }))

  const salesParams = useMemo(() => {
    if (salesRange === 'custom') {
      const range = {
        startDate: customSalesRange.startDate || sevenDayRange.startDate,
        endDate: customSalesRange.endDate || sevenDayRange.endDate
      }
      return range
    }
    if (salesRange === '30') return lastNDays(30)
    return sevenDayRange
  }, [salesRange, customSalesRange.startDate, customSalesRange.endDate])

  const fetchSalesSummary = async () => {
    setLoading('sales', true)
    try {
      const res = await api.reports.salesSummary(salesParams)
      const payload = res?.summary ? res : res?.data || res
      setSalesSummary(payload)
      setSalesDaily(payload?.daily || [])
      setLoaded('sales')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load sales summary')
    } finally {
      setLoading('sales', false)
    }
  }

  const fetchTopProducts = async () => {
    setLoading('top-products', true)
    try {
      const res = await api.reports.topProducts({ limit: Number(topLimit) })
      setTopProducts(res?.data || res || [])
      setLoaded('top-products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load top products')
    } finally {
      setLoading('top-products', false)
    }
  }

  const fetchInventoryStatus = async () => {
    setLoading('inventory', true)
    try {
      const res = await api.reports.inventoryStatus()
      setInventoryStatus(res?.data || res)
      setLoaded('inventory')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load inventory status')
    } finally {
      setLoading('inventory', false)
    }
  }

  const fetchSupplierReport = async () => {
    setLoading('supplier', true)
    try {
      const res = await api.reports.supplierRestock()
      setSupplierReport(res?.data || res || [])
      setLoaded('supplier')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load supplier report')
    } finally {
      setLoading('supplier', false)
    }
  }

  const fetchCustomerReport = async () => {
    setLoading('customer', true)
    try {
      const res = await api.reports.customerReport()
      setCustomerReport(res?.data || res || [])
      setLoaded('customer')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customer report')
    } finally {
      setLoading('customer', false)
    }
  }

  useEffect(() => {
    if (activeTab === 'sales' && !tabIsLoaded('sales')) fetchSalesSummary()
    if (activeTab === 'top-products' && !tabIsLoaded('top-products')) fetchTopProducts()
    if (activeTab === 'inventory' && !tabIsLoaded('inventory')) fetchInventoryStatus()
    if (activeTab === 'supplier' && !tabIsLoaded('supplier')) fetchSupplierReport()
    if (activeTab === 'customer' && !tabIsLoaded('customer')) fetchCustomerReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'sales') fetchSalesSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesParams.startDate, salesParams.endDate])

  useEffect(() => {
    if (activeTab === 'top-products' && tabIsLoaded('top-products')) fetchTopProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topLimit])

  const exportCurrentTab = () => {
    if (activeTab === 'sales') {
      exportToCSV('sales-summary.csv', [
        { key: 'date', header: 'Date' },
        { key: 'orders', header: 'Orders' },
        { key: 'revenue', header: 'Revenue' },
        { key: 'avgOrderValue', header: 'Avg Order Value' }
      ], salesDaily.map((day) => ({
        date: day._id,
        orders: day.orderCount,
        revenue: day.totalRevenue,
        avgOrderValue: day.avgOrderValue
      })))
      return
    }

    if (activeTab === 'top-products') {
      exportToCSV('top-products.csv', [
        { key: 'rank', header: 'Rank' },
        { key: 'product', header: 'Product' },
        { key: 'category', header: 'Category' },
        { key: 'units_sold', header: 'Units Sold' },
        { key: 'total_revenue', header: 'Total Revenue' }
      ], topProducts.map((row, index) => ({
        rank: index + 1,
        product: row.product?.name || '—',
        category: row.product?.category || '—',
        units_sold: row.units_sold,
        total_revenue: row.total_revenue
      })))
      return
    }

    if (activeTab === 'inventory') {
      exportToCSV('inventory-status.csv', [
        { key: 'product', header: 'Product' },
        { key: 'category', header: 'Category' },
        { key: 'price', header: 'Price' },
        { key: 'stock_qty', header: 'Stock Qty' },
        { key: 'reorder_lvl', header: 'Reorder Level' },
        { key: 'status', header: 'Status' },
        { key: 'stock_value', header: 'Stock Value' }
      ], (inventoryStatus?.allProducts || []).map((product) => ({
        product: product.name,
        category: product.category,
        price: product.price,
        stock_qty: product.stock_qty,
        reorder_lvl: product.reorder_lvl,
        status: product.stock_qty <= 0 ? 'Out of Stock' : product.stock_qty <= product.reorder_lvl ? 'Low Stock' : 'In Stock',
        stock_value: Number(product.price || 0) * Number(product.stock_qty || 0)
      })))
      return
    }

    if (activeTab === 'supplier') {
      exportToCSV('supplier-restock-report.csv', [
        { key: 'supplier', header: 'Supplier' },
        { key: 'city', header: 'City' },
        { key: 'totalRestocks', header: 'Total Restocks' },
        { key: 'totalQtyAdded', header: 'Total Qty Added' },
        { key: 'lastRestockDate', header: 'Last Restock Date' }
      ], supplierReport.map((row) => ({
        supplier: row.supplier?.name,
        city: row.supplier?.city,
        totalRestocks: row.totalRestocks,
        totalQtyAdded: row.totalQtyAdded,
        lastRestockDate: row.lastRestockDate
      })))
      return
    }

    exportToCSV('customer-report.csv', [
      { key: 'rank', header: 'Rank' },
      { key: 'customer', header: 'Customer' },
      { key: 'phone', header: 'Phone' },
      { key: 'orders', header: 'Orders' },
      { key: 'totalSpend', header: 'Total Spend' },
      { key: 'lastOrderDate', header: 'Last Order Date' }
    ], customerReport.map((row, index) => ({
      rank: index + 1,
      customer: row.customer?.name,
      phone: row.customer?.phone,
      orders: row.totalOrders,
      totalSpend: row.totalSpend,
      lastOrderDate: row.lastOrderDate
    })))
  }

  const salesDailyChart = salesDaily.map((day) => ({
    date: day._id,
    revenue: Number(day.totalRevenue || 0),
    orders: Number(day.orderCount || 0)
  }))

  const salesSummaryCards = salesSummary?.summary || {}
  const bestDay = salesDaily.reduce((best, current) => {
    if (!best) return current
    return Number(current.totalRevenue || 0) > Number(best.totalRevenue || 0) ? current : best
  }, null)

  const salesColumns = [
    { key: 'date', header: 'Date' },
    { key: 'orders', header: 'Orders' },
    { key: 'revenue', header: 'Revenue', render: (value) => formatCurrency(value) },
    { key: 'avgOrderValue', header: 'Avg Order Value', render: (value) => formatCurrency(value) }
  ]

  const topProductColumns = [
    { key: 'rank', header: 'Rank' },
    { key: 'product', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'units_sold', header: 'Units Sold' },
    { key: 'total_revenue', header: 'Total Revenue', render: (value) => formatCurrency(value) }
  ]

  const inventoryColumns = [
    { key: 'product', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (value) => formatCurrency(value) },
    { key: 'stock_qty', header: 'Stock Qty' },
    { key: 'reorder_lvl', header: 'Reorder Level' },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const color = row.stock_qty <= 0 ? 'red' : row.stock_qty <= row.reorder_lvl ? 'yellow' : 'green'
        const label = row.stock_qty <= 0 ? 'Out of Stock' : row.stock_qty <= row.reorder_lvl ? 'Low Stock' : 'In Stock'
        return <Badge text={label} color={color} />
      }
    },
    { key: 'stock_value', header: 'Stock Value', render: (value) => formatCurrency(value) }
  ]

  const supplierColumns = [
    { key: 'supplier', header: 'Supplier' },
    { key: 'city', header: 'City' },
    { key: 'totalRestocks', header: 'Total Restocks' },
    { key: 'totalQtyAdded', header: 'Total Qty Added' },
    { key: 'lastRestockDate', header: 'Last Restock Date', render: (value) => formatReportDate(value) }
  ]

  const customerColumns = [
    { key: 'rank', header: 'Rank' },
    { key: 'customer', header: 'Customer' },
    { key: 'phone', header: 'Phone' },
    { key: 'orders', header: 'Orders' },
    { key: 'totalSpend', header: 'Total Spend', render: (value) => formatCurrency(value) },
    { key: 'lastOrderDate', header: 'Last Order Date', render: (value) => formatReportDate(value) }
  ]

  const inventoryChartData = useMemo(() => {
    const categories = (inventoryStatus?.allProducts || []).reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {})
    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }, [inventoryStatus])

  const topProductsChartData = useMemo(() => {
    return (topProducts || []).map((row) => ({
      name: row.product?.name || '—',
      units_sold: row.units_sold,
      category: row.product?.category || 'Other'
    }))
  }, [topProducts])

  const supplierChartData = useMemo(() => {
    return (supplierReport || []).map((row) => ({
      name: row.supplier?.name || '—',
      qty: row.totalQtyAdded
    }))
  }, [supplierReport])

  const customerChartData = useMemo(() => {
    return (customerReport || []).slice(0, 10).map((row) => ({
      name: row.customer?.name || '—',
      spend: row.totalSpend
    }))
  }, [customerReport])

  const currentTabLoading = Boolean(tabLoading[activeTab])

  const renderSalesTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sales Summary</h2>
            <p className="text-sm text-slate-500">Review completed orders over a chosen date range.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={exportCurrentTab} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button type="button" onClick={fetchSalesSummary} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { key: '7', label: 'Last 7 days' },
            { key: '30', label: 'Last 30 days' },
            { key: 'custom', label: 'Custom Range' }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSalesRange(option.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${salesRange === option.key ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {salesRange === 'custom' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:max-w-xl">
            <input type="date" value={customSalesRange.startDate} onChange={(e) => setCustomSalesRange((current) => ({ ...current, startDate: e.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white" />
            <input type="date" value={customSalesRange.endDate} onChange={(e) => setCustomSalesRange((current) => ({ ...current, endDate: e.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white" />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(salesSummaryCards.grandTotal)} subtitle={`Period: ${formatReportDate(salesSummary?.period?.start)} to ${formatReportDate(salesSummary?.period?.end)}`} color="green" />
        <StatCard title="Total Orders" value={salesSummaryCards.totalOrders || 0} subtitle="Completed orders" color="blue" />
        <StatCard title="Avg Order Value" value={formatCurrency(salesSummaryCards.totalOrders ? (salesSummaryCards.grandTotal || 0) / salesSummaryCards.totalOrders : 0)} subtitle="Revenue per order" color="yellow" />
        <StatCard title="Best Day" value={bestDay?._id || '—'} subtitle={bestDay ? formatCurrency(bestDay.totalRevenue) : 'No data'} color="gray" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-900">Daily Revenue</h3>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesDailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
              <Tooltip content={<SalesChartTooltip />} />
              <Bar dataKey="revenue" fill="#06b6d4" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={salesColumns}
          data={salesDaily.map((day) => ({
            date: day._id,
            orders: day.orderCount,
            revenue: day.totalRevenue,
            avgOrderValue: day.avgOrderValue
          }))}
          loading={false}
        />
      </div>
    </div>
  )

  const renderTopProductsTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Top Products</h2>
            <p className="text-sm text-slate-500">Rank products by units sold and revenue.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={topLimit} onChange={(e) => setTopLimit(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white">
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
            </select>
            <button type="button" onClick={exportCurrentTab} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsChartData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="units_sold" radius={[0, 10, 10, 0]}>
                {topProductsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable columns={topProductColumns} data={topProducts.map((row, index) => ({
          rank: index + 1,
          product: row.product?.name || '—',
          category: row.product?.category || '—',
          units_sold: row.units_sold,
          total_revenue: row.total_revenue
        }))} loading={false} />
      </div>
    </div>
  )

  const renderInventoryTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Inventory Status</h2>
            <p className="text-sm text-slate-500">Current stock health across all products.</p>
          </div>
          <button type="button" onClick={exportCurrentTab} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Products" value={inventoryStatus?.summary?.totalProducts || 0} subtitle="All catalog items" color="blue" />
        <StatCard title="Low Stock" value={inventoryStatus?.summary?.lowStockCount || 0} subtitle="At or below reorder level" color="yellow" />
        <StatCard title="Out of Stock" value={inventoryStatus?.summary?.outOfStockCount || 0} subtitle="Zero quantity" color="red" />
        <StatCard title="Total Stock Value" value={formatCurrency(inventoryStatus?.summary?.totalStockValue || 0)} subtitle="Inventory valuation" color="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Products by Category</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={inventoryChartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {inventoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={inventoryColumns}
            data={(inventoryStatus?.allProducts || []).map((product) => ({
              ...product,
              stock_value: Number(product.price || 0) * Number(product.stock_qty || 0)
            }))}
            loading={false}
          />
        </div>
      </div>
    </div>
  )

  const renderSupplierTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Supplier Report</h2>
            <p className="text-sm text-slate-500">Restock activity summarized by supplier.</p>
          </div>
          <button type="button" onClick={exportCurrentTab} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="qty" fill="#0f172a" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={supplierColumns}
          data={supplierReport.map((row) => ({
            supplier: row.supplier?.name || '—',
            city: row.supplier?.city || '—',
            totalRestocks: row.totalRestocks,
            totalQtyAdded: row.totalQtyAdded,
            lastRestockDate: row.lastRestockDate
          }))}
          loading={false}
        />
      </div>
    </div>
  )

  const renderCustomerTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Customer Report</h2>
            <p className="text-sm text-slate-500">Top customers ranked by spend.</p>
          </div>
          <button type="button" onClick={exportCurrentTab} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerChartData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="spend" fill="#06b6d4" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={customerColumns}
          data={customerReport.map((row, index) => ({
            rank: index + 1,
            customer: row.customer?.name || '—',
            phone: row.customer?.phone || '—',
            orders: row.totalOrders,
            totalSpend: row.totalSpend,
            lastOrderDate: row.lastOrderDate
          }))}
          loading={false}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold">Reports & Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Switch between sales, product, inventory, supplier, and customer reporting with lazy data loading and export-ready tables.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${activeTab === tab.key ? 'bg-slate-950 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {currentTabLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            Loading report…
          </div>
          <div className="mt-6">
            <TabSkeleton />
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'sales' && renderSalesTab()}
          {activeTab === 'top-products' && renderTopProductsTab()}
          {activeTab === 'inventory' && renderInventoryTab()}
          {activeTab === 'supplier' && renderSupplierTab()}
          {activeTab === 'customer' && renderCustomerTab()}
        </>
      )}
    </div>
  )
}
