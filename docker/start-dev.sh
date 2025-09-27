#!/bin/bash

# GrubStack Development Environment Startup Script
# This script starts all services in development mode

echo "🚀 Starting GrubStack Development Environment..."

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

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration before running again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo "✅ GrubStack Development Environment is starting up!"
echo "🌐 Frontend: http://localhost:8081"
echo "🔌 API Gateway: http://localhost:8080"
echo "📊 Eureka Dashboard: http://localhost:8761"
echo "🗄️  MySQL: localhost:3307"
echo "📧 Kafka: localhost:9092"
echo ""
echo "📝 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop: docker-compose down"
