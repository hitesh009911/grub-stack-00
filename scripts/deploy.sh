#!/bin/bash

# GrubStack Deployment Script
# This script handles deployment of the GrubStack application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
REGISTRY=${2:-ghcr.io}
IMAGE_TAG=${3:-latest}

echo -e "${BLUE}🚀 Starting GrubStack deployment...${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Registry: $REGISTRY${NC}"
echo -e "${YELLOW}Image Tag: $IMAGE_TAG${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build images
echo -e "${BLUE}🔨 Building Docker images...${NC}"

# Build all microservices
services=("eureka-server" "user-service" "restaurant-service" "order-service" "delivery-service" "admin-service" "api-gateway" "notification-service" "frontend")

for service in "${services[@]}"; do
    echo -e "${YELLOW}Building $service...${NC}"
    docker build -f docker/$service/Dockerfile -t $REGISTRY/grubstack/$service:$IMAGE_TAG .
done

echo -e "${GREEN}✅ All images built successfully${NC}"

# Deploy based on environment
case $ENVIRONMENT in
    "development")
        echo -e "${BLUE}🏗️  Deploying to development environment...${NC}"
        docker-compose -f docker-compose.yml up -d
        ;;
    "staging")
        echo -e "${BLUE}🏗️  Deploying to staging environment...${NC}"
        docker-compose -f docker-compose.staging.yml up -d
        ;;
    "production")
        echo -e "${BLUE}🏗️  Deploying to production environment...${NC}"
        docker-compose -f docker-compose.prod.yml up -d
        ;;
    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        echo -e "${YELLOW}Usage: $0 [development|staging|production] [registry] [tag]${NC}"
        exit 1
        ;;
esac

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo -e "${BLUE}🏥 Checking service health...${NC}"

services_to_check=(
    "eureka-server:8761"
    "user-service:8082"
    "restaurant-service:8083"
    "order-service:8085"
    "delivery-service:8084"
    "admin-service:8087"
    "api-gateway:8080"
    "frontend:8081"
)

for service in "${services_to_check[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f http://localhost:$port/actuator/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is healthy${NC}"
    else
        echo -e "${RED}❌ $name is not responding${NC}"
    fi
done

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${BLUE}📊 Service URLs:${NC}"
echo -e "${YELLOW}  Frontend: http://localhost:8081${NC}"
echo -e "${YELLOW}  API Gateway: http://localhost:8080${NC}"
echo -e "${YELLOW}  Eureka Dashboard: http://localhost:8761${NC}"
echo -e "${YELLOW}  User Service: http://localhost:8082${NC}"
echo -e "${YELLOW}  Restaurant Service: http://localhost:8083${NC}"
echo -e "${YELLOW}  Order Service: http://localhost:8085${NC}"
echo -e "${YELLOW}  Delivery Service: http://localhost:8084${NC}"
echo -e "${YELLOW}  Admin Service: http://localhost:8087${NC}"

