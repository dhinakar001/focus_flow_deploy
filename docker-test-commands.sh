#!/bin/bash
# Quick test commands for FocusFlow Docker setup
# Usage: bash docker-test-commands.sh

set -e

echo "🐳 FocusFlow Docker Test Commands"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    echo -n "Testing $name... "
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

echo "1. Building Docker images..."
docker-compose build

echo ""
echo "2. Starting services..."
docker-compose up -d

echo ""
echo "3. Waiting for services to be healthy (30 seconds)..."
sleep 30

echo ""
echo "4. Checking service status..."
docker-compose ps

echo ""
echo "5. Testing health endpoints..."
echo "----------------------------"

# Test backend
if test_endpoint "http://localhost:4000/health" "Backend Health"; then
    echo "   Response:"
    curl -s http://localhost:4000/health | jq . || curl -s http://localhost:4000/health
    echo ""
fi

# Test frontend
if test_endpoint "http://localhost:3000/health" "Frontend Health"; then
    echo "   Response:"
    curl -s http://localhost:3000/health
    echo ""
fi

# Test database
echo -n "Testing Database... "
if docker-compose exec -T db pg_isready -U focusflow > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "6. Service URLs:"
echo "----------------"
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:4000"
echo "  Backend Health: http://localhost:4000/health"
echo "  Database:    postgresql://focusflow:focusflow_password@localhost:5432/focusflow"
echo ""

echo "7. Viewing logs (Ctrl+C to exit)..."
echo "-----------------------------------"
docker-compose logs -f



