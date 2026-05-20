# Relations and Diagrams

This file captures the project ER diagrams, relational schema, and the key data concepts used in RetailIQ.

## Logical ER Diagram

```mermaid
erDiagram
  PRODUCTS {
    ObjectId _id
    string name
    string category
    number price
    number stock_qty
    number reorder_lvl
    ObjectId supplier
  }
  CUSTOMERS {
    ObjectId _id
    string name
    string email
    string phone
    string address
  }
  ORDERS {
    ObjectId _id
    ObjectId customer
    date order_date
    number total_amt
    string payment_mode
    string status
  }
  ORDERITEMS {
    ObjectId _id
    ObjectId order
    ObjectId product
    number quantity
    number unit_price
  }
  SUPPLIERS {
    ObjectId _id
    string name
    string city
  }
  RESTOCKLOGS {
    ObjectId _id
    ObjectId product
    ObjectId supplier
    date date
    number qty_added
  }

  CUSTOMERS ||--o{ ORDERS : places
  ORDERS ||--o{ ORDERITEMS : contains
  PRODUCTS ||--o{ ORDERITEMS : included_in
  SUPPLIERS ||--o{ PRODUCTS : supplies
  SUPPLIERS ||--o{ RESTOCKLOGS : restocks
  PRODUCTS ||--o{ RESTOCKLOGS : restocked_by
```

One-line explanation: This ER diagram shows the main entities and how orders and restocks connect customers, products, and suppliers.

---

## Relational Schema (PK/FK View)

```mermaid
classDiagram
  class Customers {
    +ObjectId _id <<PK>>
    +string name
    +string email
    +string phone
    +string address
  }
  class Orders {
    +ObjectId _id <<PK>>
    +ObjectId customer <<FK>>
    +date order_date
    +number total_amt
    +string payment_mode
    +string status
  }
  class OrderItems {
    +ObjectId _id <<PK>>
    +ObjectId order <<FK>>
    +ObjectId product <<FK>>
    +number quantity
    +number unit_price
  }
  class Products {
    +ObjectId _id <<PK>>
    +string name
    +string category
    +number price
    +number stock_qty
    +number reorder_lvl
    +ObjectId supplier <<FK>>
  }
  class Suppliers {
    +ObjectId _id <<PK>>
    +string name
    +string city
  }
  class RestockLogs {
    +ObjectId _id <<PK>>
    +ObjectId product <<FK>>
    +ObjectId supplier <<FK>>
    +date date
    +number qty_added
  }

  Customers "1" --> "many" Orders : customer
  Orders "1" --> "many" OrderItems : items
  Products "1" --> "many" OrderItems : product
  Suppliers "1" --> "many" Products : supplies
  Products "1" --> "many" RestockLogs : restock
  Suppliers "1" --> "many" RestockLogs : restock
```

One-line explanation: This schema view makes primary and foreign key relationships explicit for a relational model mapping.

---

## Document Model for Orders (Embedded Items)

```mermaid
flowchart TD
  A[Order Document] --> B[items[] array]
  B --> C[productId]
  B --> D[quantity]
  B --> E[unit_price]
  A --> F[customerId]
  A --> G[total_amt]
```

One-line explanation: Orders embed line items to preserve price and quantity at the time of sale.

---

## Order Lifecycle

```mermaid
stateDiagram-v2
  [*] --> Pending
  Pending --> Completed
  Pending --> Cancelled
  Completed --> Cancelled
```

One-line explanation: Orders move through status states to control inventory updates and reporting.

---

## Restock Flow

```mermaid
flowchart LR
  A[Restock Form] --> B[Create RestockLog]
  B --> C[Post-save hook]
  C --> D[Increment Product stock_qty]
  D --> E[Inventory Status Report]
```

One-line explanation: Restock logs drive inventory updates and feed reporting views.

---

## Authentication Flow (JWT)

```mermaid
sequenceDiagram
  participant U as User
  participant C as Client
  participant S as API Server
  U->>C: Enter username and password
  C->>S: POST /auth/login
  S-->>C: JWT token + user
  C->>S: API request with Authorization header
  S-->>C: Protected data
```

One-line explanation: The client logs in once and then uses JWT to access protected routes.

---

## Report Aggregation Pipeline

```mermaid
flowchart LR
  A[Orders Collection] --> B[$match date range + status]
  B --> C[$unwind items]
  C --> D[$group totals]
  D --> E[$sort]
  E --> F[Report Output]
```

One-line explanation: Reports use MongoDB aggregation stages to compute sales and top products.

---

## Index Usage Map

```mermaid
flowchart TD
  Q1[Query: Orders by date] --> I1[Index: orders.order_date]
  Q2[Query: Customers by email] --> I2[Index: customers.email]
  Q3[Query: Products low stock] --> I3[Index: products.stock_qty]
  Q4[Query: Products by category] --> I4[Index: products.category]
```

One-line explanation: Indexes speed up frequent filters used in lists and reports.

---

## System Architecture

```mermaid
graph LR
  A[React Client] --> B[Express API]
  B --> C[MongoDB Atlas]
  B --> D[JWT Auth]
  C --> E[Backups]
```

One-line explanation: The app follows a client API database architecture with JWT-based authentication.

---

## Concepts Used (Summary)
- One-to-many relationships (customers to orders, suppliers to products)
- Embedded documents for order line items
- Aggregation pipelines for reports
- Indexing for faster searches
- Role-based access control with JWT
- Data validation in controllers and models
