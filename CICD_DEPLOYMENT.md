# GrubStack CI/CD Deployment Guide

This guide covers the complete CI/CD setup for the GrubStack application using GitHub Actions, Docker, and Kubernetes.

## 🏗️ CI/CD Architecture

### Pipeline Overview
```
Code Push → CI Pipeline → Build & Test → Security Scan → Docker Build → CD Pipeline → Deploy
```

### Environments
- **Development**: `develop` branch → Staging environment
- **Production**: `main` branch → Production environment
- **Releases**: Git tags → Production with versioning

## 🚀 Quick Start

### 1. Enable GitHub Actions
1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Enable GitHub Actions if not already enabled

### 2. Set up Secrets
Go to **Settings** → **Secrets and variables** → **Actions** and add:

#### Required Secrets
```bash
# Docker Registry
GITHUB_TOKEN  # Automatically provided

# Database
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_PASSWORD=your-secure-password

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@grubstack.com

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Optional: Monitoring & Notifications
SONAR_TOKEN=your-sonarcloud-token
SLACK_WEBHOOK=your-slack-webhook-url
```

### 3. Set up Environments
1. Go to **Settings** → **Environments**
2. Create environments:
   - `staging`
   - `production`
3. Add environment-specific secrets if needed

## 📋 CI/CD Workflows

### 1. Continuous Integration (`ci.yml`)
**Triggers**: Push to `main`/`develop`, Pull Requests

**Jobs**:
- **Code Quality & Security**: ESLint, TypeScript, SonarCloud, Trivy
- **Build & Test**: Maven build, npm build, integration tests
- **Docker Build & Push**: Build and push Docker images to GHCR

### 2. Continuous Deployment (`cd.yml`)
**Triggers**: After successful CI on `main`/`develop`

**Jobs**:
- **Deploy to Staging**: Deploy `develop` branch to staging
- **Deploy to Production**: Deploy `main` branch to production
- **Rollback**: Automatic rollback on failure

### 3. Security Scanning (`security.yml`)
**Triggers**: Weekly schedule, Push/PR to `main`/`develop`

**Jobs**:
- **Dependency Scan**: npm audit, Maven OWASP dependency check
- **Container Scan**: Trivy vulnerability scanning
- **Secrets Scan**: TruffleHog secrets detection

### 4. Release Management (`release.yml`)
**Triggers**: Git tags (e.g., `v1.0.0`)

**Jobs**:
- **Create Release**: Generate GitHub release with changelog
- **Build Release Images**: Build and push tagged images
- **Deploy to Production**: Deploy release to production

## 🐳 Docker Registry

### GitHub Container Registry (GHCR)
- **Registry**: `ghcr.io/your-username/grub-stack-00`
- **Images**: Automatically built and pushed on every push
- **Tags**: 
  - `latest` (main branch)
  - `develop` (develop branch)
  - `v1.0.0` (release tags)

### Pull Images
```bash
# Pull latest image
docker pull ghcr.io/your-username/grub-stack-00:latest

# Pull specific version
docker pull ghcr.io/your-username/grub-stack-00:v1.0.0
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (local or cloud)
- `kubectl` configured
- `helm` installed (optional)

### Deploy to Kubernetes
```bash
# Create namespace and configs
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy services
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n grubstack
kubectl get services -n grubstack
```

### Using Helm (Optional)
```bash
# Install Helm chart
helm install grubstack ./helm/grubstack

# Upgrade deployment
helm upgrade grubstack ./helm/grubstack

# Uninstall
helm uninstall grubstack
```

## 🔧 Configuration

### Environment Variables

#### Development
```yaml
SPRING_PROFILES_ACTIVE: development
LOG_LEVEL: DEBUG
MYSQL_DATABASE: grubstack_dev
```

#### Staging
```yaml
SPRING_PROFILES_ACTIVE: staging
LOG_LEVEL: INFO
MYSQL_DATABASE: grubstack_staging
```

#### Production
```yaml
SPRING_PROFILES_ACTIVE: production
LOG_LEVEL: WARN
MYSQL_DATABASE: grubstack_prod
```

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | React application |
| API Gateway | 8080 | Request routing |
| Eureka Server | 8761 | Service discovery |
| User Service | 8082 | User management |
| Restaurant Service | 8083 | Restaurant management |
| Order Service | 8085 | Order management |
| Delivery Service | 8086 | Delivery management |
| Admin Service | 8087 | Admin management |
| Notification Service | 8086 | Notifications |
| Payment Service | 8084 | Payment processing |

## 📊 Monitoring & Observability

### Health Checks
All services include health check endpoints:
- **Actuator**: `/actuator/health`
- **Readiness**: `/actuator/health/readiness`
- **Liveness**: `/actuator/health/liveness`

### Logging
- **Centralized Logging**: All logs are collected and can be forwarded to ELK stack
- **Log Levels**: Configurable per environment
- **Structured Logging**: JSON format for better parsing

### Metrics
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **Custom Metrics**: Business metrics and KPIs

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
gh run list
gh run view [run-id]

# Local build test
docker-compose build
```

#### 2. Deployment Failures
```bash
# Check pod status
kubectl get pods -n grubstack

# Check pod logs
kubectl logs -f [pod-name] -n grubstack

# Check service status
kubectl get services -n grubstack
```

#### 3. Database Connection Issues
```bash
# Check database pod
kubectl get pods -n grubstack | grep mysql

# Check database logs
kubectl logs -f [mysql-pod] -n grubstack

# Test database connection
kubectl exec -it [mysql-pod] -n grubstack -- mysql -u root -p
```

### Debug Commands

#### Docker
```bash
# Check running containers
docker ps

# Check container logs
docker logs [container-name]

# Execute command in container
docker exec -it [container-name] bash
```

#### Kubernetes
```bash
# Check cluster status
kubectl cluster-info

# Check node status
kubectl get nodes

# Check resource usage
kubectl top nodes
kubectl top pods -n grubstack
```

## 🔒 Security Best Practices

### 1. Secrets Management
- Use Kubernetes secrets for sensitive data
- Rotate secrets regularly
- Never commit secrets to repository

### 2. Container Security
- Use minimal base images
- Regular security scanning
- Keep images updated

### 3. Network Security
- Use network policies
- Enable TLS/SSL
- Restrict access with RBAC

### 4. Code Security
- Regular dependency updates
- Security scanning in CI/CD
- Code review process

## 📈 Performance Optimization

### 1. Resource Limits
```yaml
resources:
  limits:
    memory: "1Gi"
    cpu: "500m"
  requests:
    memory: "512Mi"
    cpu: "250m"
```

### 2. Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: grubstack-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: grubstack-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 3. Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy
- Caching layer

## 🚀 Deployment Strategies

### 1. Rolling Updates (Default)
- Zero-downtime deployments
- Gradual rollout
- Automatic rollback on failure

### 2. Blue-Green Deployment
- Instant switchover
- Full environment duplication
- Quick rollback capability

### 3. Canary Deployment
- Gradual traffic shifting
- A/B testing capability
- Risk mitigation

## 📝 Best Practices

### 1. Git Workflow
- Use feature branches
- Require pull request reviews
- Use conventional commits
- Tag releases properly

### 2. CI/CD Pipeline
- Fast feedback loops
- Parallel job execution
- Comprehensive testing
- Security scanning

### 3. Monitoring
- Set up alerts
- Monitor key metrics
- Regular health checks
- Log analysis

## 🆘 Support

### Getting Help
1. **Check logs** for error messages
2. **Review this documentation**
3. **Check GitHub Issues**
4. **Contact the development team**

### Useful Commands
```bash
# Check CI/CD status
gh run list

# View workflow logs
gh run view [run-id]

# Check deployment status
kubectl get all -n grubstack

# Monitor logs
kubectl logs -f deployment/grubstack-app -n grubstack
```

---

**Happy Deploying! 🚀**
