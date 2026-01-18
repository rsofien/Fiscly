#!/bin/bash

# Fiscly - Start both backend and frontend

echo "🚀 Starting Fiscly..."

# Navigate to project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Create logs directory if it doesn't exist
mkdir -p logs

echo "📦 Starting backend (Strapi)..."
cd invoice-backend
nohup npm run develop > ../logs/strapi.log 2>&1 &
STRAPI_PID=$!
echo "✓ Backend started (PID: $STRAPI_PID)"

# Wait a bit for backend to start
sleep 5

echo "🎨 Starting frontend (Next.js)..."
cd ../invoice-app
nohup npm run dev > ../logs/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo "✓ Frontend started (PID: $NEXTJS_PID)"

echo ""
echo "✅ Fiscly is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend: http://localhost:3000"
echo "⚙️  Backend:  http://localhost:1337"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Logs:"
echo "  Backend:  logs/strapi.log"
echo "  Frontend: logs/nextjs.log"
echo ""
echo "To stop both services, run:"
echo "  pkill -f 'npm run develop'; pkill -f 'npm run dev'"
echo ""

# Create logs directory
mkdir -p logs

# Start frontend
echo -e "${BLUE}Starting Next.js Frontend on port 3000...${NC}"
cd invoice-app
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

sleep 2

# Start backend
echo -e "${BLUE}Starting Strapi Backend on port 1337...${NC}"
cd invoice-backend

if [ "$HAS_DOCKER" = true ]; then
  # Check if Docker container is already running
  if docker ps | grep -q "fiscly_postgres"; then
    echo -e "${YELLOW}PostgreSQL container already running${NC}"
  else
    echo -e "${BLUE}Starting PostgreSQL with Docker Compose...${NC}"
    docker-compose up -d
    sleep 5
  fi
fi

npm run develop > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Services are starting up...                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:  ${BLUE}http://localhost:1337${NC}"
echo -e "Admin:    ${BLUE}http://localhost:1337/admin${NC}"
echo ""
echo -e "${YELLOW}Login credentials:${NC}"
echo -e "  Email:    admin@acme.com"
echo -e "  Password: password123"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Frontend: logs/frontend.log"
echo -e "  Backend:  logs/backend.log"
echo ""
echo -e "${YELLOW}To stop services, press Ctrl+C${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down services...${NC}"
  kill $FRONTEND_PID 2>/dev/null
  kill $BACKEND_PID 2>/dev/null
  if [ "$HAS_DOCKER" = true ]; then
    cd invoice-backend
    docker-compose down 2>/dev/null
    cd ..
  fi
  echo -e "${GREEN}Services stopped${NC}"
}

# Set up trap to cleanup on exit
trap cleanup EXIT

# Wait for processes
wait $FRONTEND_PID $BACKEND_PID
