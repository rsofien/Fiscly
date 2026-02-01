# Fiscly - Complete Invoice Management System

A production-ready, full-stack invoice management application with an ultra clean, elegant dashboard UI. Built with Next.js 14, Express.js, MongoDB, and modern web technologies.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

**Fiscly** is a complete invoice management system designed for freelancers and small businesses. It provides:

- ✨ Ultra-clean, elegant dashboard UI with Inter Tight typography
- 🔐 Secure multi-tenant architecture with workspace isolation
- 📊 Real-time analytics and reporting with interactive charts
- 💰 Full invoice CRUD with automatic number generation
- 👥 Customer management with status tracking
- 🎨 Modern design system with custom colors and spacing
- 📱 Fully responsive design (desktop, tablet, mobile)
- ⚡ Production-ready with proper error handling and validation

## 🚀 Quick Start

### Using the startup scripts (Recommended)

**macOS/Linux:**
```bash
cd /Users/rhoumasofien/Local\ Sites/Fiscly
./start.sh
```

**Windows:**
```bash
cd "C:\Users\...\Local Sites\Fiscly"
start.bat
```

This will automatically:
1. Install dependencies (if needed)
2. Connect to MongoDB database
3. Seed the database with sample data
4. Start the Express.js backend (port 1337)
5. Start the Next.js frontend (port 3000)

Then visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:1337

**Login with:**
- Email: `admin@acme.com`
- Password: `password123`

### Manual Setup

See detailed instructions below for manual installation.

## 📁 Project Structure

```
Fiscly/
├── invoice-app/              # Next.js Frontend
│   ├── app/
│   │   ├── auth/            # Login/Signup pages
│   │   ├── customers/       # Customer management
│   │   ├── dashboard/       # Main dashboard
│   │   ├── invoices/        # Invoice management
│   │   ├── reports/         # Analytics & reports
│   │   └── settings/        # Workspace settings
│   ├── components/
│   │   ├── layout/          # App layout & navigation
│   │   ├── customers/       # Customer table
│   │   ├── invoices/        # Invoice table
│   │   ├── reports/         # Chart components
│   │   └── ui/              # 13 shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration
│   │   └── utils.ts         # Helper functions
│   ├── types/               # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express.js Backend
│   ├── src/
│   │   ├── routes/          # API Routes
│   │   │   ├── workspace.ts # Workspace API
│   │   │   ├── customer.ts  # Customer API
│   │   │   ├── invoice.ts   # Invoice API
│   │   │   └── auth.ts      # Authentication API
│   │   ├── models/          # MongoDB Models
│   │   ├── middleware/      # Auth middleware
│   │   ├── db.ts            # Database connection
│   │   └── seed.ts          # Database seeding
│   ├── package.json
│   └── README.md
│
├── start.sh                 # macOS/Linux startup script
├── start.bat               # Windows startup script
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **NextAuth.js v4** - Authentication
- **React Hook Form** - Form handling
- **TanStack Table** - Data tables
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Express.js 4** - Web framework
- **MongoDB** - NoSQL Database
- **Mongoose 7** - MongoDB ODM
- **JWT** - Authentication tokens
- **Node.js 18+** - Runtime
- **TypeScript** - Type safety

### DevOps
- **Node.js** - Runtime environment

## ✨ Features

### Authentication
- ✅ Email/password signup with workspace creation
- ✅ Secure login with JWT tokens
- ✅ Protected routes with server-side validation
- ✅ Multi-tenant workspace support

### Dashboard
- ✅ Key metrics (total invoices, outstanding amount, paid this month)
- ✅ Top customers list
- ✅ Payment gateway integration placeholders
- ✅ Announcement/welcome card

### Customers
- ✅ Full CRUD operations
- ✅ Search and filtering
- ✅ Status management (active/inactive)
- ✅ Contact information storage
- ✅ Invoice history per customer

### Invoices
- ✅ Create, read, update, delete invoices
- ✅ Automatic invoice number generation
- ✅ Status tracking (draft, sent, paid, overdue, cancelled)
- ✅ Line items with quantity and pricing
- ✅ Payment method selection
- ✅ Date tracking (issue date, due date, paid date)

### Reports & Analytics
- ✅ Monthly revenue trend chart
- ✅ Invoice status distribution (pie chart)
- ✅ Invoice volume by month (bar chart)
- ✅ Top customers by revenue
- ✅ Multiple report views (Overview, Revenue, Customers)
- ✅ Export reports to CSV

### Settings
- ✅ Workspace configuration
- ✅ Personal profile management
- ✅ Invoice defaults (prefix, payment terms)
- ✅ Custom invoice notes template

## 💻 Installation

### Prerequisites

- **Node.js 18+** - Download from https://nodejs.org/
- **MongoDB** - Local instance or MongoDB Atlas
- **Git** - For version control
- **npm or yarn** - Package managers

### Step 1: Clone/Download the Project

```bash
cd /Users/rhoumasofien/Local\ Sites/Fiscly
# or wherever you saved the project
```

### Step 2: Install Frontend Dependencies

```bash
cd invoice-app
npm install
cd ..
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Set Up Database

#### Option A: MongoDB Atlas (Recommended for Production)

1. Create a free account at https://www.mongodb.com/atlas
2. Create a new cluster and get your connection string
3. Add the connection string to your backend `.env` file

#### Option B: Local MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo service mongodb start
```

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/
2. Run the installer
3. Start MongoDB service

## ⚙️ Configuration

### Frontend Configuration

Update [invoice-app/.env.local](invoice-app/.env.local):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:1337
API_URL=http://localhost:1337
```

### Backend Configuration

Update [backend/.env](backend/.env):

```env
PORT=1337
DATABASE_URL=mongodb://localhost:27017/fiscly
JWT_SECRET=your-jwt-secret-key-here
```

## 🎮 Running the Application

### Option 1: Using Startup Script (Easiest)

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

### Option 2: Manual Start

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

Backend will be available at http://localhost:1337

**Terminal 2 - Start Frontend:**
```bash
cd invoice-app
npm run dev
```

Frontend will be available at http://localhost:3000

### Initial Login

Use these credentials to log in:
- **Email**: admin@acme.com
- **Password**: password123

This user has access to the "Acme Corporation" workspace with 3 sample customers and 3 sample invoices.

## 📡 API Documentation

### Base URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:1337/api

### Key Endpoints

#### Authentication
```bash
POST   /api/auth/local                # Login
POST   /api/auth/local/register       # Register
```

#### Workspaces
```bash
GET    /api/workspaces                # List all workspaces
GET    /api/workspaces/:id            # Get workspace
POST   /api/workspaces                # Create workspace
PUT    /api/workspaces/:id            # Update workspace
DELETE /api/workspaces/:id            # Delete workspace
```

#### Customers
```bash
GET    /api/customers                 # List customers
GET    /api/customers/:id             # Get customer
POST   /api/customers                 # Create customer
PUT    /api/customers/:id             # Update customer
DELETE /api/customers/:id             # Delete customer
```

#### Invoices
```bash
GET    /api/invoices                  # List invoices
GET    /api/invoices/:id              # Get invoice
POST   /api/invoices                  # Create invoice
PUT    /api/invoices/:id              # Update invoice
DELETE /api/invoices/:id              # Delete invoice
```

### Example API Call

```bash
# Get all customers
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:1337/api/customers

# Create a new customer
curl -X POST http://localhost:1337/api/customers \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "New Customer",
      "email": "customer@example.com",
      "phone": "+1-555-123-4567",
      "company": "Example Corp",
      "status": "active",
      "workspace": 1
    }
  }'
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Push to GitHub:
```bash
cd invoice-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/fiscly-frontend.git
git push -u origin main
```

2. Connect to Vercel:
   - Visit https://vercel.com
   - Import your repository
   - Add environment variables
   - Deploy!

### Backend Deployment (Railway or Heroku)

**Using Railway:**
1. Sign up at https://railway.app
2. Connect your GitHub repository
3. Add MongoDB plugin (or use MongoDB Atlas)
4. Set environment variables
5. Deploy!

**Using Heroku:**
```bash
cd backend
heroku login
heroku create fiscly-backend
heroku config:set DATABASE_URL=mongodb+srv://...
git push heroku main
```

### Production Environment Variables

Update backend `.env`:
```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/fiscly
JWT_SECRET=generate-secure-random-string
```

Update frontend `.env.production`:
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-secure-random-string
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
```

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: Kill the process using the port
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**: 
1. Ensure MongoDB is running
2. Check `.env` database configuration
3. Verify connection: `mongosh --eval "db.adminCommand('ping')"`

### Cannot connect to Backend from Next.js

**Solution**: Check CORS settings in `backend/src/index.ts` - the backend allows all origins by default with `app.use(cors())`

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [TailwindCSS Guide](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Docker Documentation](https://docs.docker.com)

## 📝 License

MIT License - Free to use for personal or commercial projects.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the individual README files in `invoice-app/` and `backend/`
3. Check console logs for error messages

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────┐
│                    Workspace                    │
├─────────────────────────────────────────────────┤
│ • id (UUID)                                     │
│ • name (string)                                 │
│ • email (email)                                 │
│ • address, phone, taxId, invoicePrefix, etc.   │
│ • users (1-to-many)                            │
│ • customers (1-to-many)                        │
│ • invoices (1-to-many)                         │
└─────────────────────────────────────────────────┘
         ↓           ↓              ↓
    ┌────────┐  ┌─────────┐  ┌──────────┐
    │  User  │  │Customer │  │ Invoice  │
    ├────────┤  ├─────────┤  ├──────────┤
    │ • id   │  │ • id    │  │ • id     │
    │ • name │  │ • name  │  │ • number │
    │ • email│  │ • email │  │ • date   │
    │        │  │ • status│  │ • amount │
    └────────┘  └─────────┘  │ • status │
                       ↓      │ • items  │
                   ┌──────────┴──────────┐
                   │   InvoiceItem      │
                   ├────────────────────┤
                   │ • description      │
                   │ • quantity         │
                   │ • unitPrice        │
                   │ • total            │
                   └────────────────────┘
```

---

**Fiscly** - Beautiful invoice management, simplified. ✨

Built with ❤️ for freelancers and small businesses.
