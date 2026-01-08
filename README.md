# Fiscly - Complete Invoice Management System

A production-ready, full-stack invoice management application with an ultra clean, elegant dashboard UI. Built with Next.js 14, Strapi 4, PostgreSQL, and modern web technologies.

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
2. Start PostgreSQL with Docker Compose
3. Seed the database with sample data
4. Start the Strapi backend (port 1337)
5. Start the Next.js frontend (port 3000)

Then visit:
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin

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
├── invoice-backend/         # Strapi Backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── workspace/   # Workspace API
│   │   │   ├── customer/    # Customer API
│   │   │   ├── invoice/     # Invoice API
│   │   │   └── invoice-item/# Line items API
│   │   ├── extensions/
│   │   │   └── users-permissions/ # Extended User model
│   │   ├── seeders/         # Database seeding
│   │   └── config/          # Configuration
│   ├── docker-compose.yml   # PostgreSQL + Strapi setup
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
- **Strapi 4** - Headless CMS & API
- **PostgreSQL 16** - Database
- **Node.js 18+** - Runtime
- **TypeScript** - Type safety

### DevOps
- **Docker & Docker Compose** - Containerization
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
- **PostgreSQL 13+** (or Docker Desktop for Docker Compose)
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
cd invoice-backend
npm install pg  # PostgreSQL driver
cd ..
```

### Step 4: Set Up Database

#### Option A: Using Docker (Recommended)

```bash
cd invoice-backend
docker-compose up -d
cd ..
```

This starts PostgreSQL automatically.

#### Option B: Manual PostgreSQL Setup

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb fiscly_invoices
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb fiscly_invoices
```

**Windows:**
1. Download PostgreSQL installer from https://www.postgresql.org/
2. Run the installer and remember the password
3. Create database: Open pgAdmin or use Command Prompt:
   ```cmd
   psql -U postgres -c "CREATE DATABASE fiscly_invoices;"
   ```

## ⚙️ Configuration

### Frontend Configuration

Update [invoice-app/.env.local](invoice-app/.env.local):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_URL=http://localhost:1337
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fiscly_invoices
```

### Backend Configuration

The backend is pre-configured. Update [invoice-backend/.env](invoice-backend/.env) if needed:

```env
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fiscly_invoices
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fiscly_invoices
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
cd invoice-backend
npm run develop
```

Backend will be available at http://localhost:1337

**Terminal 2 - Start Frontend:**
```bash
cd invoice-app
npm run dev
```

Frontend will be available at http://localhost:3000

**Terminal 3 (Optional) - Strapi Admin:**
Visit http://localhost:1337/admin to manage content types and permissions.

### Initial Login

Use these credentials to log in:
- **Email**: admin@acme.com
- **Password**: password123

This user has access to the "Acme Corporation" workspace with 3 sample customers and 3 sample invoices.

## 📡 API Documentation

### Base URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:1337/api
- Backend Admin: http://localhost:1337/admin

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
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy!

**Using Heroku:**
```bash
cd invoice-backend
heroku login
heroku create fiscly-backend
heroku addons:create heroku-postgresql:standard-0
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

### Production Environment Variables

Update backend `.env`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/fiscly_invoices
ADMIN_JWT_SECRET=generate-secure-random-string
API_TOKEN_SALT=generate-secure-random-string
APP_KEYS=key1,key2,key3,key4
```

Update frontend `.env.production`:
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-secure-random-string
NEXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
STRAPI_URL=https://api.yourdomain.com
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

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: 
1. Ensure PostgreSQL is running
2. Check `.env` database configuration
3. Verify database exists: `psql -l`

### Strapi Admin Panel Not Loading

**Solution**:
```bash
cd invoice-backend
npm run build
npm run develop
```

### Cannot connect to Strapi from Next.js

**Solution**: Check CORS settings in `invoice-backend/src/config/api.ts`

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [TailwindCSS Guide](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com)

## 📝 License

MIT License - Free to use for personal or commercial projects.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the individual README files in `invoice-app/` and `invoice-backend/`
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
