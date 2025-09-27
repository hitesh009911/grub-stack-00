#!/bin/bash

# GrubStack Health Check Script
# This script checks the health of all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NAMESPACE="grubstack"
TIMEOUT=60

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -n, --namespace NS       Kubernetes namespace (default: grubstack)"
    echo "  -t, --timeout SECONDS    Timeout in seconds (default: 60)"
    echo "  -h, --help               Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            usage
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🏥 Running health checks for GrubStack in namespace: $NAMESPACE${NC}"
echo ""

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${RED}Error: Namespace '$NAMESPACE' does not exist${NC}"
    exit 1
fi

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local path=$3
    
    echo -n "Checking $service_name... "
    
    # Get service IP
    local service_ip=$(kubectl get service $service_name -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [ -z "$service_ip" ]; then
        # Use cluster IP if load balancer IP is not available
        service_ip=$(kubectl get service $service_name -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
    fi
    
    if [ -z "$service_ip" ]; then
        echo -e "${RED}❌ Service not found${NC}"
        return 1
    fi
    
    # Check if service is accessible
    if kubectl run health-check-$service_name --image=curlimages/curl --rm -i --restart=Never --timeout=${TIMEOUT}s -- curl -s -f http://$service_name:$port$path > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Function to check pod status
check_pods() {
    echo -e "${YELLOW}🔍 Checking pod status...${NC}"
    
    local unhealthy_pods=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase!=Running -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
    
    if [ -n "$unhealthy_pods" ]; then
        echo -e "${RED}❌ Unhealthy pods found: $unhealthy_pods${NC}"
        kubectl get pods -n $NAMESPACE
        return 1
    else
        echo -e "${GREEN}✅ All pods are running${NC}"
        return 0
    fi
}

# Function to check service endpoints
check_endpoints() {
    echo -e "${YELLOW}🔍 Checking service endpoints...${NC}"
    
    local services=("grubstack-frontend" "grubstack-api-gateway" "grubstack-eureka" "grubstack-user-service" "grubstack-restaurant-service" "grubstack-order-service" "grubstack-delivery-service" "grubstack-admin-service" "grubstack-notification-service" "grubstack-payment-service")
    
    for service in "${services[@]}"; do
        if kubectl get service $service -n $NAMESPACE &> /dev/null; then
            local endpoints=$(kubectl get endpoints $service -n $NAMESPACE -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
            if [ -n "$endpoints" ]; then
                echo -e "  $service: ${GREEN}✅ Has endpoints${NC}"
            else
                echo -e "  $service: ${RED}❌ No endpoints${NC}"
            fi
        else
            echo -e "  $service: ${YELLOW}⚠️  Service not found${NC}"
        fi
    done
}

# Run health checks
echo -e "${YELLOW}🔍 Checking pod status...${NC}"
check_pods

echo ""
echo -e "${YELLOW}🔍 Checking service endpoints...${NC}"
check_endpoints

echo ""
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check service health
check_service "grubstack-frontend" "80" "/health"
check_service "grubstack-api-gateway" "8080" "/actuator/health"
check_service "grubstack-eureka" "8761" "/actuator/health"
check_service "grubstack-user-service" "8082" "/actuator/health"
check_service "grubstack-restaurant-service" "8083" "/actuator/health"
check_service "grubstack-order-service" "8085" "/actuator/health"
check_service "grubstack-delivery-service" "8086" "/actuator/health"
check_service "grubstack-admin-service" "8087" "/actuator/health"
check_service "grubstack-notification-service" "8086" "/actuator/health"
check_service "grubstack-payment-service" "8084" "/actuator/health"

echo ""
echo -e "${BLUE}📊 Service Status Summary:${NC}"
kubectl get pods -n $NAMESPACE -o wide

echo ""
echo -e "${BLUE}🔗 Service URLs:${NC}"
kubectl get services -n $NAMESPACE -o wide

echo ""
echo -e "${GREEN}✅ Health check completed!${NC}"
