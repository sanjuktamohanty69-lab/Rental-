# Retail Inventory Management System

Retail Inventory Management System is a full-stack retail operations app for managing products, suppliers, customers, orders, restocks, and analytics. The backend uses Node.js, Express.js, MongoDB, and Mongoose, while the frontend uses React, Vite, Tailwind CSS, and Recharts.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Recharts, Axios |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Reporting | MongoDB aggregation pipelines |
| Tooling | Nodemon, PostCSS, Autoprefixer |

## Folder Structure

```text
/retail-inventory
├── /server
│   ├── /config
│   ├── /controllers
│   ├── /middleware
│   ├── /models
│   ├── /routes
│   ├── server.js
│   └── package.json
├── /client
│   ├── /src
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd retail-inventory
```

### 2. Create a MongoDB Atlas cluster

- Create a free MongoDB Atlas cluster.
- Create a database user and allow your IP address.
- Copy the connection string from Atlas.

### 3. Configure and run the backend

```bash
cd server
npm install
cp .env.example .env
```

Update `server/.env` with your MongoDB Atlas connection string and JWT secret:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

Seed demo data and start the backend:

```bash
npm run seed
npm run dev
```

The backend runs on `http://localhost:5000`.

### 4. Configure and run the frontend

```bash
cd ../client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Default Login Credentials

| Role | Username | Password |
| --- | --- | --- |
| Admin | admin | admin123 |
| Staff | staff1 | staff123 |

## API Endpoints Reference

| Area | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/register` | Register user |
| Auth | POST | `/api/auth/login` | Login user |
| Products | GET | `/api/products` | List products |
| Products | GET | `/api/products/low-stock` | Low stock products |
| Products | GET | `/api/products/:id` | Product details |
| Products | POST | `/api/products` | Create product |
| Products | PUT | `/api/products/:id` | Update product |
| Products | DELETE | `/api/products/:id` | Delete product |
| Suppliers | GET | `/api/suppliers` | List suppliers |
| Suppliers | GET | `/api/suppliers/:id` | Supplier details |
| Suppliers | GET | `/api/suppliers/:id/restocks` | Supplier restock history |
| Suppliers | POST | `/api/suppliers` | Create supplier |
| Suppliers | PUT | `/api/suppliers/:id` | Update supplier |
| Suppliers | DELETE | `/api/suppliers/:id` | Delete supplier |
| Customers | GET | `/api/customers` | List customers |
| Customers | GET | `/api/customers/:id` | Customer details |
| Customers | GET | `/api/customers/:id/orders` | Customer order history |
| Customers | POST | `/api/customers` | Create customer |
| Customers | PUT | `/api/customers/:id` | Update customer |
| Customers | DELETE | `/api/customers/:id` | Delete customer |
| Orders | GET | `/api/orders` | List orders |
| Orders | GET | `/api/orders/:id` | Order details |
| Orders | POST | `/api/orders` | Create order |
| Orders | PATCH | `/api/orders/:id/status` | Update order status |
| Orders | DELETE | `/api/orders/:id` | Delete pending order |
| Restock | GET | `/api/restock` | List restocks |
| Restock | GET | `/api/restock/:id` | Restock detail |
| Restock | POST | `/api/restock` | Create restock |
| Reports | GET | `/api/reports/sales-summary` | Sales summary report |
| Reports | GET | `/api/reports/top-products` | Top products report |
| Reports | GET | `/api/reports/inventory-status` | Inventory status report |
| Reports | GET | `/api/reports/supplier-restock` | Supplier restock report |
| Reports | GET | `/api/reports/customer-report` | Customer report |

## Screenshots

Add screenshots of the dashboard, products, orders, restock, and reports pages here.

## Academic Information

- MSRIT DBMS Semester IV Project
- Team: Krish (1MS25CS408), Prithviraj (1MS24CS133)
