# 🛒 E-Commerce REST API

A production-ready, modular **E-Commerce backend** built with **NestJS** and **TypeScript**, following a scalable, layered architecture inspired by enterprise frameworks like **.NET**. The API powers a full e-commerce flow — from authentication and product catalog management to cart, checkout, payments, and order tracking.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white) ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

---

## 📖 Table of Contents

- 🧭 Overview
- ✨ Features
- 🧰 Tech Stack
- 🏗️ Architecture
- 📁 Project Structure
- 🚀 Getting Started]]
- 🔑 Environment Variables
- 📡 API Reference
- 🛡️ Security
- 🗺️ Roadmap
- 📬 Postman Collection

---

## 🧭 Overview

This project implements a complete e-commerce backend as a REST API, designed around **NestJS's modular architecture** — each business domain (Users, Products, Cart, Orders, Reviews, Coupons...) lives in its own self-contained module with clear boundaries between controllers, services, and data access layers.

The goal of this project was to move beyond a minimal Express.js setup and build something closer to an **enterprise-grade backend**: strongly typed, dependency-injected, testable, and easy to extend — while keeping REST conventions and MongoDB flexibility.

---

## ✨Features

### 🔐 Authentication & Authorization

- JWT-based authentication (Signup / Signin / Logout)
- Refresh token rotation with HTTP-only cookies
- Role-Based Access Control (RBAC) — Admin vs. regular users

### 👤 User Management

- CRUD operations for user accounts
- Profile updates with multipart/form-data uploads
- Admin user listing with search & pagination

### 🛍️ Product Catalog

- Categories, sub-categories, and brands
- Product creation with image uploads
- Advanced filtering, search, sorting, and pagination

### 🎟️ Coupon System

- Admin-managed discount coupons
- Create, update, delete, and search functionality

### 🛒 Cart & Orders

- Add / update / remove cart items
- Checkout flow supporting **Cash on Delivery** and **Card Payment (Stripe)**
- Order history and order status tracking

### ⭐ Reviews & Ratings

- Product-level reviews with ratings
- User-scoped review access, update, and delete

### 🖼️ Media Uploads

- Cloudinary integration for product and user images
- File type and size validation

### 🛡️ Backend Infrastructure

- Global API prefix
- CORS configuration
- Rate limiting via `@nestjs/throttler`
- Cookie parsing middleware
- Centralized DTO validation (`class-validator` / `class-transformer`)

---

## 🧰 Tech Stack

|Layer|Technology|
|---|---|
|Framework|NestJS (TypeScript)|
|Database|MongoDB + Mongoose|
|Authentication|JWT, Passport, HTTP-only Cookies|
|Payments|Stripe API|
|File Storage|Cloudinary|
|Validation|class-validator, class-transformer, DTOs|
|Rate Limiting|@nestjs/throttler|
|API Style|REST|

---

## 🏗️ Architecture

The project follows NestJS's **modular, layered architecture**, which keeps concerns separated and dependencies explicit through Dependency Injection:

```
Request → Guard → Pipe (Validation) → Controller → Service → Repository (Mongoose Model) → MongoDB
                                              ↓
                                        Interceptor (Response shaping)
```

**Design principles applied:**

- **Separation of concerns** — Controllers handle HTTP only; business logic lives in Services
- **Dependency Injection** — every provider is injected via NestJS's IoC container
- **DTO-driven validation** — every incoming request is validated and transformed before reaching business logic
- **Guards & Decorators** — authentication and role checks are handled declaratively (`@UseGuards`, custom `@Roles` decorator)
- **Domain-based modules** — `AuthModule`, `UsersModule`, `ProductsModule`, `CartModule`, `OrdersModule`, `ReviewsModule`, `CouponsModule`, each independently testable and replaceable

---

## 📁 Project Structure

```
src/
├── auth/              # JWT auth, guards, strategies, refresh token logic
├── users/             # User CRUD, profile, admin listing
├── products/          # Products, categories, sub-categories, brands
├── cart/               # Cart items & checkout logic
├── orders/            # Order creation & tracking
├── coupons/           # Coupon management
├── reviews/            # Product reviews & ratings
├── uploads/           # Cloudinary integration & file validation
├── common/            # Shared guards, decorators, filters, interceptors
├── config/            # Environment & app configuration
└── main.ts            # Application bootstrap
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Stripe account (for payment integration)
- Cloudinary account (for media uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShehabRady223/E-commers.git
cd E-commers

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the application
npm run server
```

The API will be available at `http://localhost:3000/api/v1` (adjust based on your global prefix configuration).

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# App
PORT=3000
NODE_ENV='development' || 'production'

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📡 API Reference

|Module|Base Route|Description|
|---|---|---|
|Auth|`/auth`|Signup, signin, refresh, logout|
|Users|`/users`|Profile & admin user management|
|Products|`/products`|Catalog CRUD, filtering, search|
|Categories|`/categories`|Category & sub-category management|
|Brands|`/brands`|Brand management|
|Coupons|`/coupons`|Discount coupon management|
|Cart|`/cart`|Cart item operations|
|Orders|`/orders`|Checkout & order tracking|
|Reviews|`/reviews`|Product reviews & ratings|

> Full request/response schemas, headers, and example payloads are available in the Postman collection linked below.

---

## 🛡️ Security

- Passwords hashed before persistence
- Refresh tokens stored in **HTTP-only cookies** to mitigate XSS
- Role-based guards protecting admin-only endpoints
- Rate limiting to reduce brute-force and abuse risk
- Input validation on every DTO to prevent malformed/malicious payloads
- CORS configured to restrict cross-origin access

---

## 🗺️ Roadmap

- [ ] Unit & E2E test coverage with Jest
- [ ] Redis caching for product listing
- [ ] Order email notifications
- [ ] Dockerization & CI/CD pipeline

---

## 📬 Postman Collection

Explore and test all endpoints using the Postman collection:

🔗 **[Postman Collection]**
[https://your-postman-link-here.postman.co/](https://documenter.getpostman.com/view/41862176/2sBYB2sngo](https://documenter.getpostman.com/view/41862176/2sBYB2sngo)

---

## 🙋 Author

**Shehab Rady** Backend Developer | NestJS · TypeScript · MongoDB [GitHub](https://github.com/ShehabRady223) · [LinkedIn](https://www.linkedin.com/in/shehab-rady-6008aa334?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

---

⭐ If you find this project useful, consider giving it a star on GitHub!
