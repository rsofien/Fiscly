# Fiscly Invoice Management - Strapi Backend

Production-ready Strapi v4 backend for the Fiscly invoice management system with PostgreSQL database.

## 🚀 Features

- **Content Types**: Workspace, Customer, Invoice, InvoiceItem
- **Authentication**: NextAuth.js compatible with user-workspace relations
- **Multi-tenancy**: Full workspace isolation per user
- **REST API**: Complete CRUD endpoints for all resources
- **Seed Data**: Automatic database initialization with sample data
- **Role-Based Access**: Authenticated and Public roles with granular permissions

## 📋 Prerequisites

- Node.js 18+ (included with Strapi)
- PostgreSQL 13+ (or use Docker)
- npm or yarn

## 🛠️ Installation

### Option 1: Using Docker Compose (Recommended)

```bash
cd invoice-backend
docker-compose up
```

This will:
- Start PostgreSQL database on port 5432
- Start Strapi server on port 1337
- Automatically initialize database and seed data

### Option 2: Manual Setup

#### 1. Install PostgreSQL

**macOS with Homebrew:**
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
Download from https://www.postgresql.org/download/windows/

#### 2. Install Dependencies

```bash
cd invoice-backend
npm install
```

#### 3. Configure Environment

Update `.env` file (already configured):
```dotenv
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fiscly_invoices
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
```

#### 4. Start Strapi

```bash
npm run develop
```

Visit http://localhost:1337/admin to access Strapi admin panel.

## 📁 Project Structure

```
invoice-backend/
├── src/
│   ├── api/
│   │   ├── customer/          # Customer content type
│   │   ├── invoice/           # Invoice content type
│   │   ├── invoice-item/      # Invoice item content type
│   │   └── workspace/         # Workspace content type
│   ├── extensions/
│   │   └── users-permissions/ # Extended user model with workspace
│   ├── seeders/
│   │   └── 01-seed.ts         # Database seeding script
│   ├── admin/                 # Admin panel customizations
│   ├── config/                # Configuration files
│   │   ├── api.ts             # API configuration
│   │   ├── database.ts        # Database configuration
│   │   ├── server.ts          # Server configuration
│   │   └── plugins.ts         # Plugin configuration
│   └── index.ts               # Bootstrap file
├── public/                    # Static files
├── docker-compose.yml         # Docker Compose setup
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## 🗄️ Database Schema

### Workspace
- `name`: string (required)
- `email`: email
- `address`: text
- `phone`: string
- `taxId`: string
- `invoicePrefix`: string (default: "INV")
- `defaultPaymentTerms`: integer (default: 15)
- `defaultNotes`: text
- Relations: hasMany(User), hasMany(Customer), hasMany(Invoice)

### User (Extended)
- `username`: string (required, unique)
- `email`: email (required, unique)
- `password`: string (hashed)
- `name`: string
- `confirmed`: boolean (default: false)
- `blocked`: boolean (default: false)
- Relations: belongsTo(Workspace), belongsTo(Role)

### Customer
- `name`: string (required)
- `email`: email (required)
- `phone`: string
- `company`: string
- `address`: text
- `taxId`: string
- `status`: enum (active, inactive) default: active
- `notes`: text
- Relations: belongsTo(Workspace), hasMany(Invoice)

### Invoice
- `invoiceNumber`: string (required, unique)
- `issueDate`: date (required)
- `dueDate`: date (required)
- `amount`: decimal (required)
- `status`: enum (draft, sent, paid, overdue, cancelled) default: draft
- `description`: text
- `notes`: text
- `paymentMethod`: enum (bank_transfer, card, crypto, cash) default: bank_transfer
- `paidDate`: date
- Relations: belongsTo(Customer), belongsTo(Workspace), hasMany(InvoiceItem)

### InvoiceItem
- `description`: string (required)
- `quantity`: decimal (default: 1)
- `unitPrice`: decimal (required)
- `total`: decimal (required)
- Relations: belongsTo(Invoice)

## 🔐 Authentication

### Creating a User via API

```bash
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "workspaceName": "My Company"
  }'
```

### Logging In

```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "password123"
  }'
```

Response includes `jwt` token and user data.

### Authenticated Requests

```bash
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:1337/api/customers
```

## 🌱 Seed Data

The database automatically seeds with:
- 1 Workspace: "Acme Corporation"
- 1 User: admin@acme.com / password123
- 3 Customers with various statuses
- 3 Sample Invoices with line items

To re-seed:
1. Delete the database: `dropdb fiscly_invoices`
2. Create it again: `createdb fiscly_invoices`
3. Start Strapi: `npm run develop`

## 📡 API Endpoints

### Workspaces
```
GET    /api/workspaces
GET    /api/workspaces/:id
POST   /api/workspaces
PUT    /api/workspaces/:id
DELETE /api/workspaces/:id
```

### Customers
```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Invoices
```
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices
PUT    /api/invoices/:id
DELETE /api/invoices/:id
```

### Invoice Items
```
GET    /api/invoice-items
GET    /api/invoice-items/:id
POST   /api/invoice-items
PUT    /api/invoice-items/:id
DELETE /api/invoice-items/:id
```

### Authentication
```
POST   /api/auth/local
POST   /api/auth/local/register
POST   /api/auth/send-email-confirmation
POST   /api/auth/reset-password
```

## 🔗 Integration with Next.js Frontend

The frontend is pre-configured to connect to this backend:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_URL=http://localhost:1337
```

Users can:
1. Sign up on `/auth/signup`
2. Login on `/auth/login`
3. View dashboard with mock data (or real data once API is integrated)
4. Manage customers, invoices, and reports

## 🚀 Deployment

### Production Environment Variables

```bash
# Database
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:password@host:5432/db

# Security
ADMIN_JWT_SECRET=<generate-random-string>
API_TOKEN_SALT=<generate-random-string>
TRANSFER_TOKEN_SALT=<generate-random-string>
APP_KEYS=<generate-4-keys>
ENCRYPTION_KEY=<generate-random-string>

# Strapi
NODE_ENV=production
```

### Deploy to Heroku

```bash
heroku create fiscly-backend
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

### Deploy to Railway or Render

Both platforms support Strapi with persistent storage.

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running
```bash
brew services restart postgresql@16  # macOS
sudo systemctl restart postgresql     # Linux
```

### Admin Panel Not Loading

```bash
npm run build
npm run start
```

### Clear Cache

```bash
rm -rf .cache
rm -rf build
npm run develop
```

## 📚 Learn More

- [Strapi Documentation](https://docs.strapi.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

## 📝 License

MIT License - Free to use for personal or commercial projects.

---

**Fiscly Backend** - Powerful invoice management API ✨
