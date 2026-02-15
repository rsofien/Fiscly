#!/bin/bash

set -e

echo "Starting Fiscly..."

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

mkdir -p logs

echo "Starting backend (Express + MongoDB)..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "Backend started (PID: $BACKEND_PID)"

sleep 2

echo "Starting frontend (Next.js)..."
cd invoice-app
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "Fiscly is starting up:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:1337"
echo ""
echo "Logs:"
echo "  Backend:  logs/backend.log"
echo "  Frontend: logs/frontend.log"
echo ""
echo "To stop both services:"
echo "  pkill -f 'tsx watch src/index.ts'; pkill -f 'next dev'"
echo ""

wait $BACKEND_PID $FRONTEND_PID
