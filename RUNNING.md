# Fiscly - Invoice Management System

## 🚀 EVERYTHING IS NOW RUNNING!

### Services Status
✅ **Frontend**: http://localhost:3000 (Next.js)
✅ **Backend**: http://localhost:1337 (Strapi)
✅ **Database**: PostgreSQL (fiscly_invoices)
✅ **API Access**: Public (configured automatically)

### Test Data Created
- **3 Customers**: Acme Corporation, TechStart Inc, Global Solutions
- **3 Invoices**: Draft, Sent, and Paid statuses

### How to Use

#### 1. Login
- Open http://localhost:3000
- Use admin credentials: **admin@acme.com** / **password123**

#### 2. Features Available
- ✅ **Dashboard**: View metrics and reports
- ✅ **Customers**: Add, edit, delete, export to CSV
- ✅ **Invoices**: Create, view, delete, export to CSV
- ✅ **Reports**: Revenue charts and analytics

### Adding More Data

You can add data via:
1. **Frontend UI** at http://localhost:3000
2. **Strapi Admin** at http://localhost:1337/admin
3. **API directly**:
   ```bash
   # Add customer
   curl -X POST http://localhost:1337/api/customers \
     -H "Content-Type: application/json" \
     -d '{"data":{"name":"New Customer","email":"new@example.com","status":"active"}}'
   
   # Add invoice
   curl -X POST http://localhost:1337/api/invoices \
     -H "Content-Type: application/json" \
     -d '{"data":{"invoiceNumber":"INV-004","amount":5000,"status":"sent","issueDate":"2026-01-12","dueDate":"2026-02-12"}}'
   ```

### Stop/Start Services

**Stop all:**
```bash
# Stop Strapi
ps aux | grep "[s]trapi develop" | awk '{print $2}' | xargs kill

# Stop Next.js
ps aux | grep "[n]ext dev" | awk '{print $2}' | xargs kill
```

**Start all:**
```bash
cd "/Users/rhoumasofien/Local Sites/Fiscly"
./start.sh
```

Or manually:
```bash
# Start Strapi (Terminal 1)
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-backend"
npm run develop

# Start Next.js (Terminal 2)
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-app"
npm run dev
```

### Technical Details

**Frontend Stack:**
- Next.js 14 with App Router
- TypeScript
- TanStack Table for data tables
- Recharts for analytics
- shadcn/ui components

**Backend Stack:**
- Strapi v5 (Headless CMS)
- PostgreSQL database
- REST API with automatic permissions

**API Endpoints:**
- GET/POST `/api/customers`
- GET/PUT/DELETE `/api/customers/[id]`
- GET/POST `/api/invoices`
- GET/PUT/DELETE `/api/invoices/[id]`
- GET `/api/reports`

### Troubleshooting

**Frontend not loading?**
```bash
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-app"
rm -rf .next
npm run dev
```

**Strapi not responding?**
```bash
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-backend"
rm -rf .strapi .cache dist
npm run develop
```

**Need to reset data?**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE fiscly_invoices;"
psql -U postgres -c "CREATE DATABASE fiscly_invoices;"

# Restart Strapi (will recreate tables)
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-backend"
npm run develop
```

### Environment Variables

**invoice-app/.env.local:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRAPI_URL=http://localhost:1337
```

**invoice-backend/.env:**
```env
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=fiscly_invoices
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<your-password>
```

---

## 🎉 You're all set! Open http://localhost:3000 and start managing invoices!
