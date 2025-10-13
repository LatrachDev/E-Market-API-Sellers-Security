# 🛍️ E-Market API – Sellers & Security

A modern and secure **Marketplace REST API** built with **Node.js**, **Express**, and **MongoDB**, where users can buy and sell products safely.  
Developed by **Team YouCreative** at **YouCode Nador**, this version transforms a simple e-commerce API into a **community-driven marketplace** with full authentication, authorization, and secure operations.

---

## 👥 Team Members

| Name | Role |
|------|------|
| **Mohammed Latrach** | Full Stack Developer / Project Lead |
| **Ayoub Jebbouri** | Backend Developer |
| **Ikram El Benellali** | Backend Developer |
| **Meriem El Mecaniqui** | Backend Developer |

---

## 🚀 Overview

**E-Market API – Sellers & Security** enables:
- Users to register, authenticate, and manage their profiles.
- Sellers to publish, update, and manage their products.
- Buyers to explore products, manage carts, and place orders.
- Admins to supervise roles, coupons, and reviews.
- Secure data management with JWT, bcrypt, and role-based access.

---

## 🧩 Features

### 👤 User Management
- Sign up / Login with **JWT authentication**
- Role system: `user`, `seller`, `admin`
- Profile management (view & update)
- Admins can promote users to sellers

### 🏪 Seller Space
- Create, edit, and delete own products
- Secure **image upload (Multer)**
- Product visibility control and validation
- Link between product and seller

### 🔎 Product Catalog
- Search, filter, and paginate results
- Sort by price, date, or popularity

### 🛒 Cart & Orders
- Add / remove items from cart
- Checkout with simulated payment
- Order status tracking: pending → paid → shipped → delivered → canceled
- Stock validation during checkout

### 🎟️ Coupons System
- Percentage or fixed amount discounts
- Validation: expiration, usage, min amount, etc.

### ⭐ Reviews & Ratings
- One review per user per product
- Admin moderation support
- View average product ratings

### 🔐 Security
- JWT Authentication & Role-based access
- Validation with **Joi** / **express-validator**
- Secure headers via **Helmet**
- Rate limiting with **express-rate-limit**
- CORS configuration
- Centralized error handling

### 🧪 Testing
- Unit & integration tests with **Mocha**, **Chai**, and **Supertest**
- Coverage for authentication, product, cart, and coupon flow

---

## 🧠 Architecture

- **Pattern:** MVC (Model–View–Controller)
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **Image Upload:** Multer
- **Documentation:** Swagger UI
- **Validation:** Joi / express-validator

```
📂 src/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── validations/
 ├── tests/
 └── utils/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/LatrachDev/E-Market-API-Sellers-Security.git
cd E-Market-API-Sellers-Security
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure environment variables
Create a `.env` file at the root and include:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
TOKEN_EXPIRE=7d
UPLOAD_PATH=uploads/
```

### 4️⃣ Run the project
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🧾 API Documentation

API documentation is available via **Swagger**:

```
GET /api-docs
```

Includes:
- Endpoints for users, products, carts, orders, coupons, and reviews.
- Request/response examples.
- Role-based access notes.

---

## 🧰 Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start server in development mode |
| `npm start` | Start server in production mode |
| `npm run test` | Run automated tests (Mocha + Chai + Supertest) |
| `npm run seed` | Seed the database with initial data |

---

## 🧪 Tests

Run unit and integration tests:
```bash
npm test
```

Tests cover:
- User registration and login
- Role-based access
- Product creation & retrieval
- Cart and order validation
- Coupon logic (valid / expired)

---

## 🧱 Database Design

The **MCD / Class Diagram** defines key entities and relationships:
- **User** (1) — (N) **Product**
- **User** (1) — (N) **Order**
- **Product** (1) — (N) **Review**
- **Coupon** (1) — (N) **Order**
- **Order** (1) — (N) **OrderItem**

📄 Diagram available in `/docs/mcd-diagram.pdf`

---

## 🧰 Technologies Used

| Category | Tools |
|-----------|-------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Security** | JWT, bcrypt, helmet, cors, express-rate-limit |
| **Validation** | Joi / express-validator |
| **Testing** | Mocha, Chai, Supertest |
| **Upload** | Multer |
| **Documentation** | Swagger UI |

---

## 📦 Deliverables

- ✅ MCD / Diagramme de classes + API schema  
- ✅ GitHub repository with clear commits  
- ✅ Complete README (this file)  
- ✅ Swagger documentation  
- ✅ Postman export  
- ✅ Unit & integration tests  
- ✅ Modular and scalable code  

---

## 🧑‍🏫 Evaluation Criteria

✔ Correct understanding of the project requirements  
✔ Functional JWT authentication and role management  
✔ Secure file uploads and validations  
✔ Working cart, orders, and coupons  
✔ Passing test suites  
✔ Clear modular architecture  
✔ Updated documentation  
✔ Presentation quality and delivery on time  

---

## 📅 Timeline

| Phase | Date |
|-------|------|
| **Start** | 13/10/2025 |
| **Deadline** | 17/10/2025 |
| **Duration** | 5 days |

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute with attribution.

---

## 💬 Contact

**Team YouCreative** – YouCode Nador  
📧 [youcreative.team@gmail.com]  
👤 Lead Developer: [Mohammed Latrach](https://github.com/LatrachDev)

---
