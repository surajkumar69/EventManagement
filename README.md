# EventFlow - Full-Stack Event Management System

EventFlow is a modern, responsive full-stack Event Management System built with **React.js**, **Node.js/Express.js**, **MongoDB**, and **Tailwind CSS**.

---

## Key Features

- **Authentication**: JWT-based secure auth, registration, login, forgot password mail reset, and role protection (Admin vs. User).
- **Explorer Home**: Live search, category filters, pricing type selectors, location type filters, and page index pagination.
- **Ticket Bookings**: Checkout payments using sandbox Stripe or Mock card entries, automated ticket invoices via email, and digital boarding passes with QR codes.
- **QR Gate Check-in**: In-browser QR reader using webcam to check-in ticket entries and track event attendance status.
- **Admin Management Panel**: Dashboard analytics graphs (Recharts), platform users list (role toggle and deletion), event publishing wizard with banner upload, and transaction financial reports.

---

## Technology Stack

- **Frontend**: React (Vite), Tailwind CSS (v4), React Router DOM (v6), Recharts, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.js, Multer.
- **Integrations**: Stripe payments SDK, Cloudinary image upload, Nodemailer SMTP.

---

## Folder Directory Structure

```
EventManagementSystem/
├── backend/            # Express REST API service
│   ├── config/         # Database, Cloudinary, Multer settings
│   ├── controllers/    # Route controllers (Auth, Events, Bookings, Admin, Payments)
│   ├── models/         # Mongoose Schemas (User, Event, Booking, Payment)
│   ├── routes/         # Express routes
│   └── utils/          # Email helpers, QR generators, JWT generation
├── frontend/           # Vite React Single Page Application
│   ├── src/
│   │   ├── components/ # Reusable elements (Navbar, Sidebar, EventCard)
│   │   ├── context/    # Auth, Theme (Light/Dark), and Toast alerts
│   │   ├── layouts/    # Route guards (Protected & Admin layout wrappers)
│   │   └── pages/      # Home, EventDetails, Dashboard, Admin views
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js installed (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas cloud URI

### 1. Backend Configuration
1. Open the `/backend` folder.
2. Duplicate `.env.example` and rename it to `.env`.
3. Add your MongoDB connection string and choose helper keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/event_management
   JWT_SECRET=super_secret_jwt_key_event_management_2026
   JWT_EXPIRES_IN=7d
   ```
4. Install backend dependencies and seed sample events:
   ```bash
   cd backend
   npm install
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Open the `/frontend` folder.
2. Install frontend packages:
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```
3. Run the React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Test Accounts

You can log in immediately using the seeded test accounts:

### 1. System Admin
- **Email**: `admin@eventflow.com`
- **Password**: `password123`
- **Role**: Admin (can publish events, change roles, inspect reports, scan check-ins)

### 2. Platform User
- **Email**: `user@eventflow.com`
- **Password**: `password123`
- **Role**: Standard User (can browse events, select quantities, pay using mock credit cards, download QR passes)
