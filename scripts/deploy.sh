#!/bin/bash

# GrubStack Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
REGISTRY="ghcr.io"
IMAGE_NAME="grub-stack-00"
TAG="latest"
NAMESPACE="grubstack"

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment to deploy to (development|staging|production)"
    echo "  -r, --registry REGISTRY  Docker registry URL (default: ghcr.io)"
    echo "  -i, --image IMAGE        Image name (default: grub-stack-00)"
    echo "  -t, --tag TAG            Image tag (default: latest)"
    echo "  -n, --namespace NS       Kubernetes namespace (default: grubstack)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --environment production --tag v1.0.0"
    echo "  $0 --environment staging"
    echo "  $0 --environment development --registry localhost:5000"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
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

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        ;;
    *)
        echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Must be one of: development, staging, production${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}🚀 Deploying GrubStack to $ENVIRONMENT environment${NC}"
echo -e "${BLUE}Registry: $REGISTRY${NC}"
echo -e "${BLUE}Image: $IMAGE_NAME:$TAG${NC}"
echo -e "${BLUE}Namespace: $NAMESPACE${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: kubectl is not configured or cluster is not accessible${NC}"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create namespace if it doesn't exist
echo -e "${YELLOW}📦 Creating namespace...${NC}"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply configuration
echo -e "${YELLOW}⚙️  Applying configuration...${NC}"
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Update image tag in deployment files
echo -e "${YELLOW}🔄 Updating image tags...${NC}"
sed -i.bak "s|image: .*|image: $REGISTRY/$IMAGE_NAME:$TAG|g" k8s/*.yaml

# Deploy services
echo -e "${YELLOW}🚀 Deploying services...${NC}"

# Deploy based on environment
case $ENVIRONMENT in
    development)
        kubectl apply -f k8s/development/
        ;;
    staging)
        kubectl apply -f k8s/staging/
        ;;
    production)
        kubectl apply -f k8s/production/
        ;;
esac

# Wait for deployment to complete
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
kubectl rollout status deployment/grubstack-app -n $NAMESPACE --timeout=300s

# Check pod status
echo -e "${YELLOW}🔍 Checking pod status...${NC}"
kubectl get pods -n $NAMESPACE

# Run health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
./scripts/health-check.sh --namespace $NAMESPACE

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "Environment: $ENVIRONMENT"
echo -e "Registry: $REGISTRY"
echo -e "Image: $IMAGE_NAME:$TAG"
echo -e "Namespace: $NAMESPACE"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
kubectl get services -n $NAMESPACE -o wide