#!/bin/bash

# GrubStack Stop Script
# This script stops all GrubStack services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping GrubStack services...${NC}"

# Stop all services
echo -e "${YELLOW}Stopping Docker containers...${NC}"
docker-compose down

# Remove unused images (optional)
read -p "Do you want to remove unused Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing unused images...${NC}"
    docker image prune -f
fi

# Remove unused volumes (optional)
read -p "Do you want to remove unused Docker volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing unused volumes...${NC}"
    docker volume prune -f
fi

echo -e "${GREEN}✅ All services stopped successfully${NC}"

