import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import MainLayout from './components/layout/MainLayout'

import LoginPage from './pages/Login/LoginPage'
import Dashboard from './pages/Dashboard'
import ProductList from './pages/Products/ProductList'
import ProductForm from './pages/Products/ProductForm'
import SuppliersList from './pages/SuppliersList'
import SupplierForm from './pages/SupplierForm'
import CustomerList from './pages/Customers/CustomerList'
import CustomerDetail from './pages/Customers/CustomerDetail'
import OrderList from './pages/Orders/OrderList'
import CreateOrder from './pages/Orders/CreateOrder'
import OrderDetail from './pages/Orders/OrderDetail'
import RestockPage from './pages/Restock/RestockPage'
import ReportsPage from './pages/Reports/ReportsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="suppliers" element={<SuppliersList />} />
          <Route path="suppliers/new" element={<SupplierForm />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/new" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="restock" element={<RestockPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
