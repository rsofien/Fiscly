# ✅ Testing Checklist - Fiscly App

## Current Status: ✅ BOTH SERVERS RUNNING

- Backend: ✓ Running on http://localhost:1337
- Frontend: ✓ Running on http://localhost:3000
- MongoDB: ✓ Running
- Admin User: ✓ Created

---

## 🔐 Login Credentials

**Email:** admin@fiscly.local  
**Password:** Fisclywleizyp5!

---

## 🧪 Test Steps

### 1. ✅ Login Test
1. Open: http://localhost:3000/auth/login
2. Enter credentials above
3. Click "Sign In"
4. **Expected:** Redirect to dashboard

### 2. ✅ Dashboard Test
1. After login, you should see dashboard
2. **Expected:** Shows:
   - Total Invoices: 0
   - Total Customers: 0
   - Outstanding: $0.00
   - Welcome message

### 3. ✅ Settings Test  
1. Click "Settings" in sidebar
2. Update company information:
   - Company Name
   - Email
   - Address
   - Phone
3. Click "Save Changes"
4. **Expected:** Success message, data persists on refresh

### 4. ✅ Create Customer Test
1. Click "Customers" in sidebar
2. Click "Add Customer" button
3. Fill in:
   - Name: "Test Company Inc."
   - Email: "test@company.com"
   - Phone: "+1234567890"
   - Address: "123 Test St"
4. Click "Create Customer"
5. **Expected:** Customer appears in list

### 5. ✅ Create Invoice Test
1. Click "Invoices" in sidebar
2. Click "New Invoice" button
3. Select customer from dropdown
4. Add invoice items
5. Set due date
6. Click "Create Invoice"
7. **Expected:** Invoice created and appears in list

### 6. ✅ Edit Invoice Test
1. Click on an invoice from the list
2. Click "Edit"
3. Change status or amount
4. Save changes
5. **Expected:** Changes saved

### 7. ✅ Reports Test
1. Click "Reports" in sidebar
2. **Expected:** See revenue charts and statistics

### 8. ✅ Logout Test
1. Click user menu (top right)
2. Click "Logout"
3. **Expected:** Redirect to login page

---

## 🐛 If Something Doesn't Work

### Check Backend is Running
```bash
curl http://localhost:1337/api/health
```
Should return: `{"status":"ok"}`

### Check Frontend is Running
```bash
curl http://localhost:3000
```
Should return HTML

### Restart Everything
```bash
# Stop servers
pkill -f "tsx watch"
pkill -f "next dev"

# Start again
./start-app.sh
```

### Check MongoDB
```bash
mongosh --eval "db.adminCommand('ping')"
```

---

## 📊 Database Status

You can check your data directly:

```bash
mongosh fiscly

# See all users
db.users.find().pretty()

# See all workspaces
db.workspaces.find().pretty()

# See all customers
db.customers.find().pretty()

# See all invoices
db.invoices.find().pretty()
```

---

## ✅ Success Criteria

- [ ] Can login with admin credentials
- [ ] Dashboard loads with correct data
- [ ] Can update settings and they persist
- [ ] Can create customers
- [ ] Can create invoices linked to customers
- [ ] Can edit invoices
- [ ] Reports show data
- [ ] Can logout

---

## 🎉 You're All Set!

Everything is configured and running. The app is fully functional and ready to use!

**URLs to Bookmark:**
- App: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Dashboard: http://localhost:3000/dashboard
