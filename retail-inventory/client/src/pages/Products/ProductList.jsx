import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Plus, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function getStatus(product) {
  if ((product.stock_qty || 0) <= 0) return { label: 'Out of Stock', color: 'red' }
  if ((product.stock_qty || 0) <= (product.reorder_lvl || 0)) return { label: 'Low Stock', color: 'yellow' }
  return { label: 'In Stock', color: 'green' }
}

export default function ProductList() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 400)

  const queryParams = useMemo(() => ({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    category: category || undefined,
    lowStock: lowStockOnly || undefined
  }), [page, debouncedSearch, category, lowStockOnly])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.products.getAll(queryParams)
      const rows = res.data || []
      setProducts(rows)
      setCount(res.total || rows.length || 0)
      setPages(res.pages || 1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.page, queryParams.limit, queryParams.search, queryParams.category, queryParams.lowStock])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, lowStockOnly])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.products.delete(deleteTarget._id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price (₹)', render: (value) => `₹${Number(value || 0).toLocaleString()}` },
    { key: 'stock_qty', header: 'Stock Qty' },
    { key: 'reorder_lvl', header: 'Reorder Level' },
    { key: 'supplier', header: 'Supplier', render: (supplier) => supplier ? `${supplier.name}${supplier.city ? ` • ${supplier.city}` : ''}` : '—' },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const status = getStatus(row)
        return <Badge text={status.label} color={status.color} />
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${row._id}/edit`) }}
            className="rounded-md border border-slate-700/20 p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Edit product"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}
            className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Inventory</div>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold">Products</h1>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">{count} items</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products/new')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Grocery">Grocery</option>
              <option value="Clothing">Clothing</option>
              <option value="Stationery">Stationery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
            />
            Low Stock Only
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          onRowClick={(row) => navigate(`/products/${row._id}/edit`)}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-sm text-slate-600">
          Page {page} of {pages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= pages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        message={deleteTarget ? `Delete ${deleteTarget.name}? This action cannot be undone.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
