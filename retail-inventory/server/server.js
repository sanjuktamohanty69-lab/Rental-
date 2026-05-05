const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const productsRoutes = require('./routes/productRoutes');
const suppliersRoutes = require('./routes/supplierRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restockRoutes = require('./routes/restockRoutes');
const reportsRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors()); // allow all origins for development
app.use(morgan('dev'));
app.use(express.json());

// Connect to DB
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restock', restockRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler for API routes
app.use(notFound);

// Global error handler (should be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
