# 🧾 Fiscly - Local Invoice Management App

A complete invoice management system with MongoDB backend and Next.js frontend.

## ✅ What's Working

- ✓ User authentication (register/login)
- ✓ Workspace/Settings management
- ✓ Customer CRUD operations
- ✓ Invoice CRUD operations
- ✓ Dashboard with statistics
- ✓ Reports
- ✓ Secure JWT authentication
- ✓ MongoDB database (local)

## 🚀 Quick Start

### Start Everything (Easiest Way)
```bash
./start-app.sh
```

### Or Start Manually

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd invoice-app
npm run dev
```

## 🔐 Admin Login

**URL:** http://localhost:3000/auth/login

**Credentials:**
- Email: `admin@fiscly.local`
- Password: `Fisclywleizyp5!`

*(Password is also saved in `backend/.local-admin-creds.txt`)*

## 📱 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:1337
- **MongoDB:** mongodb://localhost:27017/fiscly

## 🛠 Tech Stack

**Backend:**
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- Next.js 14
- NextAuth.js for sessions
- TailwindCSS
- shadcn/ui components

## 📋 Features

### Dashboard
- View total invoices, customers, revenue
- Outstanding amounts
- Payment statistics
- Top customers

### Customers
- Create/Edit/Delete customers
- View customer list
- Link to invoices

### Invoices
- Create/Edit/Delete invoices
- Multiple statuses: draft, sent, paid, overdue
- Link to customers
- Generate invoice numbers automatically

### Settings
- Update workspace details
- Company information
- Invoice preferences
- Default payment terms

## 🛑 Stop Servers

```bash
pkill -f "tsx watch"
pkill -f "next dev"
```

## 🔧 Troubleshooting

### MongoDB Not Running
```bash
brew services start mongodb/brew/mongodb-community@7.0
```

### Reset Database (Fresh Start)
```bash
mongosh fiscly --eval "db.dropDatabase()"
```
Then restart the backend - it will create a new admin user.

### Check Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs (in terminal where it's running)
```

## 📂 Project Structure

```
Fiscly/
├── backend/              # Express + MongoDB API
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth middleware
│   │   └── index.ts      # Server entry
│   ├── .env              # Backend config
│   └── .local-admin-creds.txt  # Admin password
│
├── invoice-app/          # Next.js frontend
│   ├── app/              # Pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities & auth
│   └── .env.local        # Frontend config
│
├── start-app.sh          # Startup script
└── logs/                 # Application logs
```

## 🔐 Security Notes

- Admin credentials are in `.local-admin-creds.txt` (git-ignored)
- JWT tokens stored in NextAuth sessions
- Passwords hashed with bcrypt
- All API endpoints protected with JWT auth

## 📝 Environment Variables

**Backend (.env):**
```
DATABASE_URL=mongodb://localhost:27017/fiscly
PORT=1337
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

**Frontend (.env.local):**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:1337
```

## 🎯 Next Steps

1. Visit http://localhost:3000
2. Login with admin credentials
3. Go to Settings and update your company info
4. Create your first customer
5. Create your first invoice

Enjoy! 🎉
