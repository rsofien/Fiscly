#!/bin/bash

# Fiscly - Local Invoice App Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting Fiscly Invoice App..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb/brew/mongodb-community@7.0
    sleep 2
fi

# Start backend
echo "📦 Starting Backend Server (port 1337)..."
cd "/Users/rhoumasofien/Local Sites/Fiscly/backend"
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"

# Wait for backend to initialize
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server (port 3000)..."
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-app"
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Fiscly is now running!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:1337"
echo ""
echo "👤 Admin Login Credentials:"
echo "   Email:    admin@fiscly.local"
echo "   Password: (Check .local-admin-creds.txt in backend folder)"
echo ""
echo "📋 To stop the servers:"
echo "   pkill -f 'tsx watch'"
echo "   pkill -f 'next dev'"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

# Keep script running
wait
