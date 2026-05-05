import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function CustomerList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })

  const debouncedSearch = useDebouncedValue(search, 400)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await api.customers.getAll({ search: debouncedSearch || undefined })
      setCustomers(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const saveCustomer = async () => {
    if (!form.name.trim()) {
      toast.error('Customer name is required')
      return
    }
    setSaving(true)
    try {
      await api.customers.create(form)
      toast.success('Customer created')
      setShowModal(false)
      setForm({ name: '', phone: '', email: '', address: '' })
      fetchCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/customers/${row._id}`)
          }}
          className="inline-flex items-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
          aria-label="View customer"
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Customers</p>
            <h1 className="mt-2 text-3xl font-semibold">Customer Directory</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">Search Customers</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable columns={columns} data={customers} loading={loading} onRowClick={(row) => navigate(`/customers/${row._id}`)} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Customer" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <textarea
              rows="3"
              value={form.address}
              onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={saveCustomer} disabled={saving} className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving…' : 'Create Customer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
