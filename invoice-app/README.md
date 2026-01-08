# Fiscly - Invoice Management System

A production-ready invoice management web application with an ultra clean, mega elegant dashboard UI.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Authentication**: NextAuth.js v4 (Credentials provider)
- **Backend**: Strapi v4 + PostgreSQL (separate service)
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 🎨 Design System

- **Typography**: Inter Tight font family
  - H1: 32px / 600 / tracking-tight
  - H2: 24px / 600
  - H3: 18px / 500
  - Body: 14px / 400

- **Colors** (HSL):
  - Background: `214 20% 98%`
  - Primary: `217 91% 60%` (#2563EB)
  - Success: `142 71% 45%` (#10B981)
  - Warning: `32 95% 48%` (#F59E0B)
  - Destructive: `0 84% 60%` (#EF4444)

- **Border Radius**: 14px

## 📁 Project Structure

```
invoice-app/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API route
│   ├── auth/                    # Login & Signup pages
│   ├── customers/               # Customer management
│   ├── dashboard/               # Main dashboard
│   ├── invoices/                # Invoice management
│   ├── reports/                 # Analytics & reports
│   ├── settings/                # Workspace settings
│   ├── globals.css              # Global styles & CSS variables
│   └── layout.tsx               # Root layout
├── components/
│   ├── customers/               # Customer table component
│   ├── invoices/                # Invoice table component
│   ├── layout/                  # App layout (header, nav)
│   ├── reports/                 # Charts components
│   └── ui/                      # shadcn/ui components (13 components)
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   └── utils.ts                 # Utility functions
└── types/
    └── next-auth.d.ts           # NextAuth type extensions
```

## ✨ Features

### Authentication
- ✅ Login with email/password
- ✅ Signup with workspace creation
- ✅ NextAuth session management
- ✅ Protected routes

### Dashboard
- ✅ Key metrics cards (Total Invoices, Outstanding, Paid This Month, Total Customers)
- ✅ Announcement card
- ✅ Top customers list
- ✅ Payment gateway integration placeholders (Redotpay, Stripe)

### Customers
- ✅ Full customer table with TanStack Table
- ✅ Search functionality
- ✅ Status badges (active/inactive)
- ✅ CSV export button
- ✅ CRUD action menu
- ⏳ Add/Edit/Delete modals (ready for implementation)

### Invoices
- ✅ Grouped invoice table by month
- ✅ Status filter tabs (All, Draft, Sent, Paid, Overdue)
- ✅ Search functionality
- ✅ Invoice status badges
- ✅ CSV export button
- ⏳ New invoice modal (ready for implementation)
- ⏳ Invoice preview/PDF generation (ready for implementation)

### Reports
- ✅ Monthly revenue trend chart (LineChart)
- ✅ Invoice status distribution (PieChart)
- ✅ Invoice volume chart (BarChart)
- ✅ Top customers by revenue (horizontal BarChart)
- ✅ Tab navigation (Overview, Revenue, Customers)
- ✅ Export report button

### Settings
- ✅ Workspace information form
- ✅ Personal information form
- ✅ Invoice settings (prefix, payment terms, notes)
- ✅ Danger zone (delete workspace)
- ⏳ Form submission handlers (ready for Strapi integration)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (for Strapi backend)
- Strapi v4 instance running (optional for now - uses mock data)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd invoice-app
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   # .env.local is already created with:
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-change-in-production
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   STRAPI_URL=http://localhost:1337
   STRAPI_API_TOKEN=your-strapi-token
   DATABASE_URL=postgresql://user:password@localhost:5432/invoicedb
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🔐 Authentication Flow

1. User navigates to `/auth/signup`
2. Fills in: Name, Email, Company Name, Password
3. Account created in Strapi with workspace
4. Auto-login via NextAuth
5. Redirected to `/dashboard`

**Login**: Email/password authentication via Strapi API

## 🗄️ Strapi Backend Setup (To Do)

The app is currently using **mock data** for development. To connect to Strapi:

### Content Types Needed:
1. **User** (built-in)
   - email, name, password
   - workspace (relation)

2. **Workspace**
   - name
   - users (relation)
   - customers (relation)

3. **Customer**
   - name, email, phone, company
   - status (enum: active, inactive)
   - workspace (relation)
   - invoices (relation)

4. **Invoice**
   - invoiceNumber, issueDate, dueDate, amount
   - status (enum: draft, sent, paid, overdue, cancelled)
   - customer (relation)
   - items (relation)

5. **InvoiceItem**
   - description, quantity, unitPrice, total
   - invoice (relation)

## 📦 UI Components

All components are in `components/ui/` following shadcn/ui patterns:

- **button** - Multiple variants (default, destructive, outline, secondary, ghost, link)
- **card** - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **input** - Styled text input
- **label** - Form labels
- **textarea** - Multi-line input
- **select** - Dropdown select
- **dialog** - Modal dialogs
- **dropdown-menu** - Context menus
- **popover** - Popovers
- **tabs** - Tab navigation
- **table** - Data tables
- **badge** - Status badges (success, warning, destructive)
- **avatar** - User avatars
- **separator** - Divider lines

## 🎯 Next Steps

1. **Set up Strapi backend**
   - Install Strapi v4
   - Define content types
   - Create API endpoints
   - Add authentication middleware

2. **Integrate Strapi API**
   - Replace mock data with real API calls
   - Add loading states
   - Error handling
   - Optimistic updates

3. **Implement CRUD Modals**
   - Customer add/edit dialogs
   - Invoice creation wizard
   - Delete confirmations

4. **CSV Export**
   - Generate CSV files from table data
   - Download functionality

5. **Invoice PDF Generation**
   - Create invoice template
   - PDF library integration (react-pdf or jsPDF)
   - Print/Download functionality

6. **Payment Gateway Integration**
   - Redotpay API integration
   - Stripe Connect
   - Webhook handlers

7. **Email Notifications**
   - Send invoice emails
   - Payment reminders
   - Overdue notifications

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_URL` | App URL | http://localhost:3000 |
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_STRAPI_URL` | Public Strapi URL | http://localhost:1337 |
| `STRAPI_URL` | Server-side Strapi URL | http://localhost:1337 |
| `STRAPI_API_TOKEN` | Strapi API token | From Strapi admin |
| `DATABASE_URL` | PostgreSQL connection | postgresql://... |

## 🐛 Known Issues

- **Strapi Backend Not Connected**: App uses mock data. Set up Strapi to enable full functionality.
- **No Real Authentication**: Login/signup will fail without Strapi. Configure Strapi auth endpoints.
- **Mock Data Only**: All data is hardcoded. Connect to Strapi API for persistence.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

**Fiscly** - Beautiful invoice management, simplified. ✨
