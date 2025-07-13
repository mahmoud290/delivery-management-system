# 🚚 Delivery Management System

A backend system for managing delivery operations, built with **NestJS** and **PostgreSQL**.

## 🧩 Features

- 👥 User authentication & authorization (Client, Driver, Admin)
- 📦 Clients can create delivery orders
- 🧑‍💼 Admins assign orders to drivers
- 🚚 Drivers update order status (`in_transit`, `delivered`)
- 👮 Role-based access control using JWT
- 🧪 Fully tested (Unit, Integration, and E2E) with **Jest**

---

## 📂 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL (via TypeORM)
- **Authentication**: JWT
- **Testing**: Jest + Supertest

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/delivery-management-system.git
cd delivery-management-system


# Run The Project
npm run start:dev


# Run The Tests

# users
npm run test:users:unit
npm run test:users:int
npm run test:users:e2e

# orders
npm run test:orders:unit
npm run test:orders:unit
npm run test:orders:unit

# drivers
npm run test:drivers:unit
npm run test:drivers:unit
npm run test:drivers:unit

# delivery-assignment
npm run test:delivery-assignment:unit
npm run test:delivery-assignment:int
npm run test:delivery-assignment:e2e






