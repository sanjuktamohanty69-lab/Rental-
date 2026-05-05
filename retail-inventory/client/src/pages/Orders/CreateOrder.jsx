import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, CreditCard, Globe, Smartphone, Plus, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'

const PAYMENT_OPTIONS = [
  { value: 'Cash', icon: Banknote },
  { value: 'Card', icon: CreditCard },
  { value: 'UPI', icon: Smartphone },
  { value: 'Online', icon: Globe }
]

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function createItemRow() {
  return {
    id: crypto.randomUUID(),
    product: null,
    query: '',
    suggestions: [],
    quantity: 1,
    unit_price: '',
    loading: false,
    open: false
  }
}

function ItemRow({ item, onChange, onRemove }) {
  const debouncedQuery = useDebouncedValue(item.query, 350)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!debouncedQuery || (item.product && debouncedQuery.trim().toLowerCase() === item.product.name.trim().toLowerCase())) {
        onChange(item.id, { suggestions: [], loading: false })
        return
      }

      try {
        onChange(item.id, { loading: true })
        const res = await api.products.getAll({ search: debouncedQuery, limit: 8 })
        if (active) {
          onChange(item.id, {
            suggestions: res.data || [],
            loading: false,
            open: true
          })
        }
      } catch (err) {
        if (active) onChange(item.id, { suggestions: [], loading: false })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [debouncedQuery, item.id, onChange])

  const subtotal = Number(item.quantity || 0) * Number(item.unit_price || 0)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative flex-1">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Product</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={item.product ? item.product.name : item.query}
              onChange={(e) => onChange(item.id, { query: e.target.value, product: null, open: true })}
              placeholder="Search by name or category"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500"
            />
          </div>

          {item.open && item.suggestions.length > 0 && (
            <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
              {item.suggestions.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => onChange(item.id, {
                    product,
                    query: product.name,
                    suggestions: [],
                    open: false,
                    quantity: 1,
                    unit_price: product.price
                  })}
                  className="flex w-full flex-col items-start border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{product.name}</span>
                  <span className="text-sm text-slate-500">{product.category} • Stock {product.stock_qty}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="mt-7 rounded-xl border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50"
          aria-label="Remove item"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Available Stock</label>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {item.product ? item.product.stock_qty : '—'}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Quantity</label>
          <input
            type="number"
            min="1"
            max={item.product?.stock_qty || undefined}
            value={item.quantity}
            onChange={(e) => onChange(item.id, { quantity: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Unit Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.unit_price}
            onChange={(e) => onChange(item.id, { unit_price: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm">
        <span className="text-slate-500">Running subtotal</span>
        <span className="font-semibold text-slate-950">{formatMoney(subtotal)}</span>
      </div>
    </div>
  )
}

export default function CreateOrder() {
  const navigate = useNavigate()
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '' })
  const [items, setItems] = useState([createItemRow()])
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const debouncedCustomerQuery = useDebouncedValue(customerQuery, 400)

  useEffect(() => {
    let active = true

    const loadCustomers = async () => {
      if (!debouncedCustomerQuery) {
        setCustomerResults([])
        return
      }

      try {
        setCustomerLoading(true)
        const res = await api.customers.getAll({ search: debouncedCustomerQuery })
        if (active) {
          setCustomerResults(res.data || [])
          setCustomerMenuOpen(true)
        }
      } catch (err) {
        if (active) setCustomerResults([])
      } finally {
        if (active) setCustomerLoading(false)
      }
    }

    loadCustomers()
    return () => {
      active = false
    }
  }, [debouncedCustomerQuery])

  const updateItem = useCallback((id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const addItem = useCallback(() => setItems((current) => [...current, createItemRow()]), [])

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0), [items])

  const validate = () => {
    if (!selectedCustomer?._id) return 'Please select a customer.'
    if (!items.length) return 'Please add at least one item.'
    for (const item of items) {
      if (!item.product?._id) return 'Please select a product for every item row.'
      if (!Number(item.quantity) || Number(item.quantity) <= 0) return 'Item quantities must be greater than zero.'
      if (Number(item.quantity) > Number(item.product.stock_qty || 0)) return `Quantity exceeds available stock for ${item.product.name}.`
    }
    return ''
  }

  const submitOrder = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        customer: selectedCustomer._id,
        payment_mode: paymentMode,
        items: items.map((item) => ({
          product: item.product._id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        }))
      }

      const res = await api.orders.create(payload)
      const order = res.data || res
      toast.success('Order placed successfully!')
      navigate(`/orders/${order._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to place order')
      toast.error(err.response?.data?.message || 'Unable to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const createCustomer = async () => {
    try {
      if (!customerForm.name.trim()) {
        toast.error('Customer name is required')
        return
      }
      const res = await api.customers.create(customerForm)
      const created = res.data || res
      setSelectedCustomer(created)
      setCustomerQuery(`${created.name} • ${created.phone || ''}`.trim())
      setCustomerResults([])
      setShowCustomerModal(false)
      setCustomerForm({ name: '', phone: '', email: '' })
      toast.success('Customer created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer')
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Orders</p>
          <h1 className="mt-2 text-3xl font-semibold">Create Order</h1>
          <p className="mt-2 text-sm text-slate-300">Select a customer, add products, and place a new order.</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Step 1: Customer Selection</h2>
              <p className="text-sm text-slate-500">Search by name or phone and choose an existing customer.</p>
            </div>
            {selectedCustomer && <Badge text={selectedCustomer.name} color="blue" />}
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value)
                  setSelectedCustomer(null)
                  setCustomerMenuOpen(true)
                }}
                onFocus={() => setCustomerMenuOpen(true)}
                placeholder="Search customers by name or phone"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </div>

            {customerMenuOpen && customerQuery && (
              <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {customerLoading ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>
                ) : customerResults.length > 0 ? (
                  customerResults.map((customer) => (
                    <button
                      key={customer._id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setCustomerQuery(`${customer.name} • ${customer.phone || ''}`.trim())
                        setCustomerMenuOpen(false)
                      }}
                      className="flex w-full flex-col items-start border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">{customer.name}</span>
                      <span className="text-sm text-slate-500">{customer.phone || 'No phone'}{customer.email ? ` • ${customer.email}` : ''}</span>
                    </button>
                  ))
                ) : (
                  <div className="space-y-2 px-4 py-3">
                    <div className="text-sm text-slate-500">No customers found.</div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerForm({ name: customerQuery, phone: '', email: '' })
                        setShowCustomerModal(true)
                      }}
                      className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                    >
                      Create New Customer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCustomerForm({ name: customerQuery, phone: '', email: '' })
                setShowCustomerModal(true)
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Create New Customer
            </button>
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null)
                  setCustomerQuery('')
                }}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Clear Selection
              </button>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Step 2: Add Items</h2>
              <p className="text-sm text-slate-500">Search products, adjust quantity, and refine unit pricing if needed.</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Another Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onChange={updateItem}
                onRemove={items.length > 1 ? removeItem : () => toast.error('At least one item is required')}
              />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Step 3: Payment Mode</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = paymentMode === option.value
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${active ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                >
                  <input
                    type="radio"
                    className="h-4 w-4 text-cyan-500"
                    checked={active}
                    onChange={() => setPaymentMode(option.value)}
                    name="payment_mode"
                  />
                  <Icon className={`h-5 w-5 ${active ? 'text-cyan-600' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium text-slate-900">{option.value}</span>
                </label>
              )
            })}
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitOrder}
              disabled={submitting}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{item.product?.name || 'Select a product'}</div>
                    <div className="text-sm text-slate-500">Qty {item.quantity || 0} × {formatMoney(item.unit_price || 0)}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{formatMoney((Number(item.quantity || 0) * Number(item.unit_price || 0)))}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
            <div className="text-sm text-slate-300">Total Amount</div>
            <div className="mt-2 text-3xl font-semibold">{formatMoney(totalAmount)}</div>
          </div>
        </div>
      </aside>

      <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="Create New Customer" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={customerForm.name}
              onChange={(e) => setCustomerForm((current) => ({ ...current, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
            <input
              value={customerForm.phone}
              onChange={(e) => setCustomerForm((current) => ({ ...current, phone: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm((current) => ({ ...current, email: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              placeholder="Email address"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCustomerModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={createCustomer} className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400">
              Create Customer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
