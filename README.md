# 📚 Synth Library — Digital Library Management System

Synth Library is a full-stack Digital Library Management Web Application built using the MERN stack. The platform provides secure authentication, OTP-based email verification, book management, borrowing workflows, and responsive user interfaces for seamless library operations.

---

## 🚀 Features

* 🔐 JWT Authentication & Secure Cookie-Based Sessions
* 📧 OTP-Based Email Verification System
* 📚 Book Management & Inventory Handling
* 🔄 Borrow & Return Transaction Workflows
* 🖼️ File/Image Upload Support using Multer
* 🌐 RESTful API Architecture
* 🎨 Responsive Frontend UI with Tailwind CSS
* ⚡ Fast Frontend Build using Vite
* ☁️ MongoDB Atlas Cloud Database Integration
* 🛡️ Security Middleware using Helmet, CORS & Rate Limiting

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* JWT Authentication
* Nodemailer
* Multer

---

## 📂 Project Structure

```bash
Synth-Library/
│
├── frontend/
│   ├── src/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── api/
│   └── ...
│
└── README.md
```

---

## ⚙️ Running the Project Locally

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd Synth-Library
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

### 3️⃣ Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

CLIENT_URL=http://localhost:5173
```

---

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## 📸 Core Functionalities

* User Registration & Login
* OTP Email Verification
* Secure Authentication
* Book Listing & Management
* Borrow / Return System
* Responsive Dashboard
* Protected Routes
* API Integration

---

