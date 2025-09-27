#!/bin/bash

# GrubStack Production Environment Startup Script
# This script starts all services in production mode

echo "🚀 Starting GrubStack Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Check for required environment variables
if [ -z "$MYSQL_ROOT_PASSWORD" ] || [ -z "$MYSQL_PASSWORD" ]; then
    echo "❌ Required environment variables not set:"
    echo "   MYSQL_ROOT_PASSWORD"
    echo "   MYSQL_PASSWORD"
    echo "   Please set these variables before running the production environment."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting production services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 60

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ GrubStack Production Environment is running!"
echo "🌐 Frontend: http://localhost:8081"
echo "🔌 API Gateway: http://localhost:8080"
echo "📊 Eureka Dashboard: http://localhost:8761"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
