#!/bin/bash

# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Fiscly Invoice Management - Full Stack Setup       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if ports are available
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    return 0
  else
    return 1
  fi
}

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check if Docker is available for postgres
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓ Docker is available${NC}"
  HAS_DOCKER=true
else
  echo -e "${YELLOW}⚠ Docker not found - will need PostgreSQL installed locally${NC}"
  HAS_DOCKER=false
fi

echo ""
echo -e "${YELLOW}Starting services...${NC}"
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
