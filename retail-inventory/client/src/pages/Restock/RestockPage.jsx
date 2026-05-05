import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import DataTable from '../../components/ui/DataTable'

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const todayValue = () => new Date().toISOString().slice(0, 10)

export default function RestockPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState([])
  const [productMenuOpen, setProductMenuOpen] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  const [qtyAdded, setQtyAdded] = useState(1)
  const [date, setDate] = useState(todayValue())
  const [saving, setSaving] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyProductFilter, setHistoryProductFilter] = useState('')
  const [historySupplierFilter, setHistorySupplierFilter] = useState('')

  const debouncedProductQuery = useDebouncedValue(productQuery, 350)

  const loadProducts = async (query) => {
    setProductLoading(true)
    try {
      const res = await api.products.getAll({ search: query || undefined, limit: query ? 10 : 100 })
      const data = res.data || []
      if (!query) {
        setProducts(data)
      }
      setProductResults(data)
    } catch (err) {
      setProductResults([])
    } finally {
      setProductLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      const res = await api.suppliers.getAll()
      setSuppliers(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load suppliers')
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const params = {}
      if (historyProductFilter) params.productId = historyProductFilter
      if (historySupplierFilter) params.supplierId = historySupplierFilter
      const res = await api.restock.getAll(params)
      setHistory(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load restock history')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
    loadProducts('')
    loadHistory()
    const selectedProductId = searchParams.get('product')
    if (selectedProductId) {
      api.products.getById(selectedProductId)
        .then((res) => {
          const product = res.data || res
          setSelectedProduct(product)
          setProductQuery(product.name)
          setProductResults([product])
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!debouncedProductQuery || (selectedProduct && debouncedProductQuery.trim().toLowerCase() === selectedProduct.name.trim().toLowerCase())) {
      setProductResults([])
      return
    }

    let active = true
    const load = async () => {
      try {
        const res = await api.products.getAll({ search: debouncedProductQuery, limit: 10 })
        if (active) {
          setProductResults(res.data || [])
          setProductMenuOpen(true)
        }
      } catch (err) {
        if (active) setProductResults([])
      }
    }

    load()
    return () => {
      active = false
    }
  }, [debouncedProductQuery])

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyProductFilter, historySupplierFilter])

  const submitRestock = async () => {
    if (!selectedProduct?._id) {
      toast.error('Please select a product')
      return
    }
    if (!selectedSupplier) {
      toast.error('Please select a supplier')
      return
    }
    if (!Number(qtyAdded) || Number(qtyAdded) < 1) {
      toast.error('Quantity must be at least 1')
      return
    }

    setSaving(true)
    try {
      const res = await api.restock.create({
        product: selectedProduct._id,
        supplier: selectedSupplier,
        qty_added: Number(qtyAdded),
        date
      })

      const updatedStock = res.updatedProduct?.stock_qty ?? res.data?.updatedProduct?.stock_qty
      toast.success(`Restock logged. New stock: ${updatedStock} units`)
      setQtyAdded(1)
      setDate(todayValue())
      await loadHistory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log restock')
    } finally {
      setSaving(false)
    }
  }

  const historyColumns = useMemo(() => ([
    { key: 'product', header: 'Product', render: (value) => value?.name || '—' },
    { key: 'supplier', header: 'Supplier', render: (value) => value?.name || '—' },
    { key: 'qty_added', header: 'Qty Added' },
    { key: 'date', header: 'Date', render: (value) => formatDate(value) }
  ]), [])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Restock</p>
          <h1 className="mt-2 text-3xl font-semibold">Add Restock Entry</h1>
          <p className="mt-2 text-sm text-slate-300">Log incoming stock and instantly update inventory counts.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Restock Form</h2>

          <div className="space-y-4">
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-slate-700">Product</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={selectedProduct ? selectedProduct.name : productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value)
                    setSelectedProduct(null)
                    setProductMenuOpen(true)
                  }}
                  onFocus={() => setProductMenuOpen(true)}
                  placeholder="Search by name or category"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
                />
              </div>

              {productMenuOpen && productQuery && productResults.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-64 w-[calc(100%-0.5rem)] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {productResults.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product)
                        setProductQuery(product.name)
                        setProductMenuOpen(false)
                      }}
                      className="flex w-full flex-col items-start border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">{product.name}</span>
                      <span className="text-sm text-slate-500">{product.category} • Current stock {product.stock_qty}</span>
                    </button>
                  ))}
                </div>
              )}
              {productLoading && <p className="mt-2 text-xs text-slate-500">Searching products…</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}{supplier.city ? ` • ${supplier.city}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={qtyAdded}
                  onChange={(e) => setQtyAdded(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={submitRestock}
              disabled={saving}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Logging…' : 'Log Restock'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Restock History</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Filter by Product</label>
              <select
                value={historyProductFilter}
                onChange={(e) => setHistoryProductFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>{product.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Filter by Supplier</label>
              <select
                value={historySupplierFilter}
                onChange={(e) => setHistorySupplierFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <DataTable columns={historyColumns} data={history} loading={historyLoading} />
        </div>
      </section>
    </div>
  )
}
