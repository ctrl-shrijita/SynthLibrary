# Digital Library

A full-stack Digital Library application with role-based Admin and User experiences.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT in HTTP-only cookies, bcrypt password hashing

## Features

- User registration and login
- Admin and user roles stored in MongoDB
- Role-specific redirects and guarded routes
- Admin book management with availability checks
- Borrow and return workflow with max active borrow limit
- Fine calculation: `$1/day` after 14 days by default
- Borrowing blocked when outstanding fines exceed `$10`
- Featured, trending, and genre-based recommendation endpoints
- Admin charts for borrows per day/week
- Responsive admin and user interfaces

## Run Locally

1. Install Node.js 20+ and MongoDB.
2. Start MongoDB locally or use MongoDB Atlas.
3. Create `backend/.env` from `backend/.env.example`.
4. Install dependencies:

```bash
npm install
npm run install:all
```

5. Optional: create a demo admin, user, and sample books:

```bash
npm run seed --prefix backend
```

6. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Demo Accounts

The seed command creates:

- Admin: `admin@example.com` / `Password123!`
- User: `user@example.com` / `Password123!`

## First Admin User Without Seed Data

Register normally, then update that user's role in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/books`
- `POST /api/books` admin
- `PATCH /api/books/:id` admin
- `DELETE /api/books/:id` admin
- `GET /api/books/featured`
- `GET /api/books/trending`
- `GET /api/books/recommendations`
- `POST /api/transactions/borrow/:bookId`
- `POST /api/transactions/return/:transactionId`
- `GET /api/transactions/my-history`
- `GET /api/transactions/admin/all` admin
- `GET /api/transactions/admin/stats` admin
