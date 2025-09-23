# 🚀 GrubStack CI/CD Pipeline

This document describes the CI/CD pipeline setup for the GrubStack food delivery application.

## 📋 Overview

The CI/CD pipeline is designed to:
- ✅ **Build** all microservices and frontend
- ✅ **Test** code quality and functionality
- ✅ **Containerize** services with Docker
- ✅ **Deploy** to different environments
- ✅ **Monitor** service health

## 🏗️ Architecture

### Services
- **Eureka Server** (8761) - Service Discovery
- **User Service** (8082) - User Management
- **Restaurant Service** (8083) - Restaurant Management
- **Order Service** (8085) - Order Processing
- **Delivery Service** (8084) - Delivery Management
- **Admin Service** (8087) - Admin Panel
- **API Gateway** (8080) - API Routing
- **Notification Service** (8086) - Notifications
- **Frontend** (8081) - React Application

### Database
- **MySQL 8.0** - Primary database for all services

## 🔧 Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Git
- GitHub account (for CI/CD)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd grubstack
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Local Development
```bash
# Start all services
./scripts/deploy.sh development

# Or use docker-compose directly
docker-compose up -d
```

### 4. Stop Services
```bash
./scripts/stop.sh
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The pipeline runs on:
- **Push to main/develop** - Full build and test
- **Pull Requests** - Code quality checks
- **Manual trigger** - On-demand execution

### Pipeline Stages

#### 1. Code Quality
- Frontend linting and type checking
- Java code formatting verification
- Dependency vulnerability scanning

#### 2. Build Services
- Compile all microservices
- Run unit tests
- Package JAR files

#### 3. Build Frontend
- Install dependencies
- Build React application
- Generate production assets

#### 4. Docker Build
- Create Docker images for all services
- Push to container registry
- Tag with branch/commit info

#### 5. Integration Tests
- Start services with test database
- Run integration test suites
- Verify service communication

#### 6. Deployment
- **Staging**: Auto-deploy on develop branch
- **Production**: Auto-deploy on main branch

## 🐳 Docker Configuration

### Dockerfiles
Each service has its own Dockerfile in `docker/<service-name>/`:
- Multi-stage builds for optimization
- Health checks for monitoring
- Security best practices

### Docker Compose
- **docker-compose.yml** - Development
- **docker-compose.staging.yml** - Staging
- **docker-compose.prod.yml** - Production

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- Eureka: `http://localhost:8761/actuator/health`
- User Service: `http://localhost:8082/actuator/health`
- Restaurant Service: `http://localhost:8083/actuator/health`
- Order Service: `http://localhost:8085/actuator/health`
- Delivery Service: `http://localhost:8084/actuator/health`
- Admin Service: `http://localhost:8087/actuator/health`
- API Gateway: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost:8081/health`

### Service URLs
- **Frontend**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761

## 🔧 Configuration

### Environment Variables

#### Development
```bash
MYSQL_ROOT_PASSWORD=root
MYSQL_PASSWORD=grubstack
SPRING_PROFILES_ACTIVE=development
```

#### Staging
```bash
MYSQL_ROOT_PASSWORD=staging_root
MYSQL_PASSWORD=staging_password
SPRING_PROFILES_ACTIVE=staging
```

#### Production
```bash
MYSQL_ROOT_PASSWORD=<secure_password>
MYSQL_PASSWORD=<secure_password>
SPRING_PROFILES_ACTIVE=production
```

### GitHub Secrets
Configure these in your GitHub repository settings:

```
MYSQL_ROOT_PASSWORD=<production_password>
MYSQL_PASSWORD=<production_password>
REGISTRY=<your-registry-url>
DEPLOY_TOKEN=<deployment-token>
```

## 🚀 Deployment

### Manual Deployment
```bash
# Development
./scripts/deploy.sh development

# Staging
./scripts/deploy.sh staging

# Production
./scripts/deploy.sh production
```

### Automated Deployment
- **Staging**: Deploys automatically on push to `develop`
- **Production**: Deploys automatically on push to `main`

## 🔍 Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check logs
docker-compose logs <service-name>

# Check service status
docker-compose ps
```

#### 2. Database Connection Issues
```bash
# Check MySQL logs
docker-compose logs mysql

# Verify database is running
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

#### 3. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8080

# Stop conflicting services
sudo systemctl stop <service-name>
```

### Debug Commands
```bash
# View all container logs
docker-compose logs -f

# Execute shell in container
docker-compose exec <service-name> /bin/bash

# Check resource usage
docker stats
```

## 📈 Performance Optimization

### Resource Limits
Production deployment includes:
- Memory limits for each service
- CPU limits for critical services
- Replica scaling for high availability

### Database Optimization
- Indexed columns for fast queries
- Connection pooling
- Query optimization

## 🔒 Security

### Security Measures
- Non-root user in containers
- Secrets management
- Network isolation
- Regular security updates

### Best Practices
- Use environment variables for secrets
- Regular dependency updates
- Security scanning in CI/CD
- Access control for deployments

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests locally
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details

---

**Happy Coding! 🎉**

