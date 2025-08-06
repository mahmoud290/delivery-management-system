# 🚚 Delivery Management System

A backend system for managing delivery operations, built with **NestJS** and **PostgreSQL**.

---

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
git clone https://github.com/mahmoud290/delivery-management-system.git
cd delivery-management-system
2. Install dependencies



npm install
3. Run the project



npm run start:dev
🧪 Run Tests
1 - Users Module

npm run test:users:unit
npm run test:users:int
npm run test:users:e2e

2 - Orders Module
npm run test:orders:unit
npm run test:orders:int
npm run test:orders:e2e

3 - Drivers Module
npm run test:drivers:unit
npm run test:drivers:int
npm run test:drivers:e2e

4 - Delivery Assignment Module
npm run test:delivery-assignment:unit
npm run test:delivery-assignment:int
npm run test:delivery-assignment:e2e
