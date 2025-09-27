#!/bin/bash

# GrubStack Stop Script
# This script stops all running containers

echo "🛑 Stopping GrubStack services..."

# Stop development environment
if [ -f docker-compose.yml ]; then
    echo "Stopping development environment..."
    docker-compose down
fi

# Stop production environment
if [ -f docker-compose.prod.yml ]; then
    echo "Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
fi

# Stop staging environment
if [ -f docker-compose.staging.yml ]; then
    echo "Stopping staging environment..."
    docker-compose -f docker-compose.staging.yml down
fi

# Clean up unused containers and images
echo "🧹 Cleaning up unused containers and images..."
docker system prune -f

echo "✅ All GrubStack services stopped and cleaned up!"
