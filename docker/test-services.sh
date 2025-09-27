#!/bin/bash

# GrubStack Service Testing Script
# This script tests all services to ensure they're working correctly

echo "🧪 Testing GrubStack Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_service() {
    local service_name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $service_name... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Test services
echo -e "${BLUE}🔍 Testing service health endpoints...${NC}"

# Test Eureka Server
test_service "Eureka Server" "http://localhost:8761/actuator/health"

# Test API Gateway
test_service "API Gateway" "http://localhost:8080/actuator/health"

# Test User Service
test_service "User Service" "http://localhost:8082/actuator/health"

# Test Restaurant Service
test_service "Restaurant Service" "http://localhost:8083/actuator/health"

# Test Order Service
test_service "Order Service" "http://localhost:8085/actuator/health"

# Test Delivery Service
test_service "Delivery Service" "http://localhost:8089/actuator/health"

# Test Admin Service
test_service "Admin Service" "http://localhost:8087/actuator/health"

# Test Notification Service
test_service "Notification Service" "http://localhost:8086/actuator/health"

# Test Payment Service
test_service "Payment Service" "http://localhost:8088/actuator/health"

# Test Frontend
test_service "Frontend" "http://localhost:8081/health"

echo ""
echo -e "${BLUE}🔍 Testing service discovery...${NC}"

# Test Eureka Dashboard
if curl -s -f "http://localhost:8761" > /dev/null 2>&1; then
    echo -e "Eureka Dashboard: ${GREEN}✅ PASS${NC}"
else
    echo -e "Eureka Dashboard: ${RED}❌ FAIL${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Testing database connectivity...${NC}"

# Test MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -proot > /dev/null 2>&1; then
    echo -e "MySQL Database: ${GREEN}✅ PASS${NC}"
else
    echo -e "MySQL Database: ${RED}❌ FAIL${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Testing Kafka...${NC}"

# Test Kafka
if docker-compose exec -T kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
    echo -e "Kafka: ${GREEN}✅ PASS${NC}"
else
    echo -e "Kafka: ${RED}❌ FAIL${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Testing API endpoints...${NC}"

# Test API endpoints
test_service "API Gateway Root" "http://localhost:8080"
test_service "Frontend Root" "http://localhost:8081"

echo ""
echo -e "${BLUE}📊 Service Status Summary:${NC}"
docker-compose ps

echo ""
echo -e "${BLUE}📋 Recent logs (last 10 lines):${NC}"
docker-compose logs --tail=10

echo ""
echo -e "${GREEN}✅ Service testing completed!${NC}"
echo -e "${YELLOW}💡 If any tests failed, check the logs with: docker-compose logs [service-name]${NC}"
