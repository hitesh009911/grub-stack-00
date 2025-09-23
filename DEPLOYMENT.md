# 🚀 GrubStack Deployment Guide

This guide covers deployment strategies for the GrubStack microservices platform.

## 📋 Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Maven 3.9+
- Node.js 18+ (for frontend)
- MySQL 8.0+
- At least 8GB RAM
- 20GB free disk space

## 🐳 Docker Deployment (Recommended)

### 1. Full Stack Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd grub-stack-00

# Build all services
mvn clean package -DskipTests

# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Infrastructure Only

```bash
# Start only infrastructure services
docker-compose up -d mysql kafka zookeeper eureka-server

# Wait for services to be ready
sleep 30

# Start microservices
docker-compose up -d user-service restaurant-service order-service notification-service
```

### 3. Production Deployment

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Or with staging configuration
docker-compose -f docker-compose.staging.yml up -d
```

## 🖥️ Local Development Setup

### 1. Start Infrastructure

```bash
# Start Kafka and Zookeeper
docker-compose -f docker-compose-kafka.yml up -d

# Start MySQL
docker run -d --name grubstack-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=grubstack \
  -p 3306:3306 \
  mysql:8.0
```

### 2. Start Services Manually

```bash
# Terminal 1: Eureka Server
cd eureka-server && mvn spring-boot:run

# Terminal 2: API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 3: User Service
cd user-service && mvn spring-boot:run

# Terminal 4: Restaurant Service
cd restaurant-service && mvn spring-boot:run

# Terminal 5: Order Service
cd order-service && mvn spring-boot:run

# Terminal 6: Notification Service
cd notification-service && mvn spring-boot:run

# Terminal 7: Delivery Service
cd delivery-service && mvn spring-boot:run

# Terminal 8: Payment Service
cd payment-service && mvn spring-boot:run

# Terminal 9: Admin Service
cd admin-service && mvn spring-boot:run
```

### 3. Start Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Configuration

### Development Environment

```yaml
# application-dev.yml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://localhost:3306/grubstack
    username: root
    password: password
  kafka:
    bootstrap-servers: localhost:9092
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:dev-email@gmail.com}
    password: ${MAIL_PASSWORD:dev-app-password}
```

### Production Environment

```yaml
# application-prod.yml
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:mysql://prod-mysql:3306/grubstack
    username: ${DB_USERNAME:grubstack}
    password: ${DB_PASSWORD:secure-password}
  kafka:
    bootstrap-servers: prod-kafka:9092
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:prod-email@gmail.com}
    password: ${MAIL_PASSWORD:prod-app-password}
```

## 🚀 Deployment Scripts

### Windows PowerShell

```powershell
# start-services.ps1
Write-Host "Starting GrubStack Services..." -ForegroundColor Green

# Set Java environment
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Start services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd eureka-server; mvn spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; mvn spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd user-service; mvn spring-boot:run"
# ... continue for other services
```

### Linux/Mac Bash

```bash
#!/bin/bash
# start-services.sh

echo "Starting GrubStack Services..."

# Start Eureka Server
cd eureka-server && mvn spring-boot:run &
sleep 5

# Start API Gateway
cd ../api-gateway && mvn spring-boot:run &
sleep 5

# Start User Service
cd ../user-service && mvn spring-boot:run &
sleep 5

# Continue for other services...
```

## 🔍 Health Checks and Monitoring

### Service Health Endpoints

```bash
# Check individual service health
curl http://localhost:8761/actuator/health  # Eureka Server
curl http://localhost:8080/actuator/health # API Gateway
curl http://localhost:8082/actuator/health # User Service
curl http://localhost:8083/actuator/health # Restaurant Service
curl http://localhost:8085/actuator/health # Order Service
curl http://localhost:8089/actuator/health # Notification Service
```

### Eureka Dashboard

Access the Eureka dashboard at: http://localhost:8761

You should see all registered services:
- API-GATEWAY
- USER-SERVICE
- RESTAURANT-SERVICE
- ORDER-SERVICE
- NOTIFICATION-SERVICE
- DELIVERY-SERVICE
- PAYMENT-SERVICE
- ADMIN-SERVICE

### Kafka UI

Access Kafka UI at: http://localhost:8080

Monitor:
- Topics and partitions
- Consumer groups
- Message flow
- Broker metrics

## 🧪 Testing Deployment

### 1. Test Service Registration

```bash
# Check if services are registered with Eureka
curl http://localhost:8761/eureka/apps

# Check specific service
curl http://localhost:8761/eureka/apps/USER-SERVICE
```

### 2. Test API Endpoints

```bash
# Test user registration
curl -X POST "http://localhost:8082/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","roles":["CUSTOMER"]}'

# Test restaurant listing
curl "http://localhost:8083/restaurants"

# Test order placement
curl -X POST "http://localhost:8085/orders" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":1,"userId":1,"items":[{"menuItemId":1,"quantity":2,"priceCents":1299}]}'
```

### 3. Test Notification Service

```bash
# Test email functionality
curl -X POST "http://localhost:8089/notifications/test/email?email=test@example.com"

# Test SMTP connection
curl -X POST "http://localhost:8089/notifications/test/smtp"

# Check notification statistics
curl "http://localhost:8089/notifications/stats"
```

## 🔧 Configuration Management

### Environment Variables

```bash
# Set environment variables
export DB_USERNAME=grubstack
export DB_PASSWORD=secure-password
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### Docker Environment

```yaml
# docker-compose.yml
services:
  user-service:
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/grubstack
      - SPRING_DATASOURCE_USERNAME=${DB_USERNAME}
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
```

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check Java version
   java -version
   
   # Check port availability
   netstat -an | grep -E "(8080|8082|8083|8085|8089)"
   
   # Check service logs
   docker-compose logs user-service
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL status
   docker ps | grep mysql
   
   # Test database connection
   mysql -h localhost -u root -p grubstack
   ```

3. **Kafka connection issues**
   ```bash
   # Check Kafka status
   docker ps | grep kafka
   
   # Test Kafka connectivity
   docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
   ```

4. **Email not sending**
   ```bash
   # Check notification service logs
   docker-compose logs notification-service
   
   # Test email configuration
   curl -X POST "http://localhost:8089/notifications/test/smtp"
   ```

### Log Analysis

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f notification-service

# View logs with timestamps
docker-compose logs -f --timestamps
```

## 🔄 Updates and Maintenance

### Rolling Updates

```bash
# Update specific service
docker-compose up -d --no-deps user-service

# Update all services
docker-compose up -d --build

# Scale service
docker-compose up -d --scale user-service=2
```

### Backup and Recovery

```bash
# Backup database
docker exec grubstack-mysql mysqldump -u root -p grubstack > backup.sql

# Backup Kafka data
docker run --rm -v kafka-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/kafka-backup.tar.gz /data
```

## 📊 Performance Monitoring

### Resource Usage

```bash
# Check container resource usage
docker stats

# Check specific service
docker stats grubstack-user-service
```

### Application Metrics

```bash
# Check service metrics
curl http://localhost:8082/actuator/metrics
curl http://localhost:8089/actuator/metrics
```

## 🛑 Shutdown Procedures

### Graceful Shutdown

```bash
# Stop all services
docker-compose down

# Stop specific services
docker-compose stop user-service notification-service

# Remove containers and volumes
docker-compose down -v
```

### Emergency Shutdown

```bash
# Force stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)
```

---

**Happy Deploying! 🚀**
