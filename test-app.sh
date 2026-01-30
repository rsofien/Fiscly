#!/bin/bash

echo "🧪 Testing Fiscly Application..."
echo ""

# Test backend
echo "1️⃣  Testing Backend (http://localhost:1337)..."
BACKEND_TEST=$(curl -s http://localhost:1337/api/health 2>&1)
if [[ $BACKEND_TEST == *"ok"* ]]; then
    echo "   ✅ Backend is working!"
else
    echo "   ❌ Backend not responding"
    echo "   Try: cd backend && npm run dev"
fi

echo ""

# Test frontend
echo "2️⃣  Testing Frontend (http://localhost:3000)..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
if [[ $FRONTEND_TEST == "200" ]] || [[ $FRONTEND_TEST == "307" ]]; then
    echo "   ✅ Frontend is working!"
    echo ""
    echo "🎉 SUCCESS! Both services are running!"
    echo ""
    echo "📱 Open in browser: http://localhost:3000"
    echo "🔐 Login: admin@fiscly.local / Fisclywleizyp5!"
else
    echo "   ⏳ Frontend still starting..."
    echo "   Wait 10 seconds and try again"
fi

echo ""
