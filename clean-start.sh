#!/bin/bash

echo "=== FISCLY CLEAN START ==="
echo ""

# Kill everything
echo "1. Killing all Node processes..."
pkill -9 node 2>/dev/null
sleep 2

# Verify ports are clear
echo "2. Verifying ports are clear..."
if lsof -i :1337 -i :3000 > /dev/null 2>&1; then
  echo "   ❌ Ports still in use!"
  lsof -i :1337 -i :3000
  exit 1
fi
echo "   ✓ Ports clear"

# Start backend
echo ""
echo "3. Starting backend..."
cd "/Users/rhoumasofien/Local Sites/Fiscly/backend"
npm run dev > /tmp/fiscly-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend
echo "   Waiting for backend to start..."
sleep 5

# Test backend
echo "   Testing backend..."
if curl -s http://localhost:1337/api/health --max-time 3 > /dev/null 2>&1; then
  echo "   ✓ Backend responding"
else
  echo "   ❌ Backend not responding"
  echo "   Last 20 lines of log:"
  tail -20 /tmp/fiscly-backend.log
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# Start frontend
echo ""
echo "4. Starting frontend..."
cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-app"
npm run dev > /tmp/fiscly-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "=== SERVERS RUNNING ==="
echo "Backend:  http://localhost:1337 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/fiscly-backend.log"
echo "  Frontend: tail -f /tmp/fiscly-frontend.log"
echo ""
echo "To stop:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
