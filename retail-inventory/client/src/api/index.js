import api from './axios'

export const auth = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data)
}

export const products = {
  getAll: (params) => api.get('/products', { params }).then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  getLowStock: () => api.get('/products/low-stock').then((r) => r.data),
  create: (data) => api.post('/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/products/${id}`).then((r) => r.data)
}

export const suppliers = {
  getAll: () => api.get('/suppliers').then((r) => r.data),
  getById: (id) => api.get(`/suppliers/${id}`).then((r) => r.data),
  getRestocks: (id) => api.get(`/suppliers/${id}/restocks`).then((r) => r.data),
  create: (data) => api.post('/suppliers', data).then((r) => r.data),
  update: (id, data) => api.put(`/suppliers/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/suppliers/${id}`).then((r) => r.data)
}

export const customers = {
  getAll: (params) => api.get('/customers', { params }).then((r) => r.data),
  getById: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  getOrders: (id) => api.get(`/customers/${id}/orders`).then((r) => r.data),
  create: (data) => api.post('/customers', data).then((r) => r.data),
  update: (id, data) => api.put(`/customers/${id}`, data).then((r) => r.data)
}

export const orders = {
  getAll: (params) => api.get('/orders', { params }).then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post('/orders', data).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
  delete: (id) => api.delete(`/orders/${id}`).then((r) => r.data)
}

export const restock = {
  getAll: (params) => api.get('/restock', { params }).then((r) => r.data),
  create: (data) => api.post('/restock', data).then((r) => r.data)
}

export const reports = {
  salesSummary: (params) => api.get('/reports/sales-summary', { params }).then((r) => r.data),
  topProducts: (params) => api.get('/reports/top-products', { params }).then((r) => r.data),
  inventoryStatus: () => api.get('/reports/inventory-status').then((r) => r.data),
  supplierRestock: () => api.get('/reports/supplier-restock').then((r) => r.data),
  customerReport: () => api.get('/reports/customer-report').then((r) => r.data)
}

export default { auth, products, suppliers, customers, orders, restock, reports }
