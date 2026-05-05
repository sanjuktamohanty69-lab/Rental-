import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'

const initialForm = {
  name: '',
  category: 'Electronics',
  price: '',
  stock_qty: 0,
  reorder_lvl: 10,
  supplier: ''
}

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState(initialForm)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (isEditMode ? 'Edit Product' : 'Add Product'), [isEditMode])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [supplierRes, productRes] = await Promise.all([
          api.suppliers.getAll(),
          isEditMode ? api.products.getById(id) : Promise.resolve(null)
        ])

        setSuppliers(supplierRes.data || [])

        if (productRes?.data) {
          const product = productRes.data
          setForm({
            name: product.name || '',
            category: product.category || 'Electronics',
            price: product.price ?? '',
            stock_qty: product.stock_qty ?? 0,
            reorder_lvl: product.reorder_lvl ?? 10,
            supplier: product.supplier?._id || product.supplier || ''
          })
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load product form')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, isEditMode])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      price: Number(form.price),
      stock_qty: Number(form.stock_qty),
      reorder_lvl: Number(form.reorder_lvl),
      supplier: form.supplier || undefined
    }

    try {
      if (isEditMode) {
        await api.products.update(id, payload)
        toast.success('Product updated')
      } else {
        await api.products.create(payload)
        toast.success('Product created')
      }
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-950 px-6 py-5 text-white shadow-lg shadow-slate-950/10">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Products</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">Maintain pricing, inventory thresholds, and supplier mapping.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center text-slate-500">Loading form…</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
              <input
                required
                value={form.name}
                onChange={handleChange('name')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.category}
                onChange={handleChange('category')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="Electronics">Electronics</option>
                <option value="Grocery">Grocery</option>
                <option value="Clothing">Clothing</option>
                <option value="Stationery">Stationery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input
                  required
                  min="0"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange('price')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-8 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Stock Quantity</label>
              <input
                min="0"
                type="number"
                value={form.stock_qty}
                onChange={handleChange('stock_qty')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Reorder Level</label>
              <input
                min="0"
                type="number"
                value={form.reorder_lvl}
                onChange={handleChange('reorder_lvl')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              />
              <p className="mt-2 text-xs text-slate-500">Alert triggers below this qty</p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Supplier</label>
              <select
                value={form.supplier}
                onChange={handleChange('supplier')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}{supplier.city ? ` • ${supplier.city}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : isEditMode ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
