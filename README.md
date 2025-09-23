# 🍔 GrubStack - Food Delivery Microservices Platform

A comprehensive food delivery platform built with Spring Boot microservices architecture, featuring real-time notifications, order tracking, and multi-tenant restaurant management.

## 🏗️ Architecture Overview

GrubStack is built using a microservices architecture with the following components:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Spring Boot microservices
- **Message Broker**: Apache Kafka + Zookeeper
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Database**: MySQL
- **Email Service**: Gmail SMTP integration

## 🚀 Quick Start

### Prerequisites

- **Java 17+** (JDK 17 or 21 recommended)
- **Maven 3.9+**
- **Docker & Docker Compose**
- **Node.js 18+** (for frontend)
- **MySQL** (or use Docker)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd grub-stack-00
```

### 2. Start Infrastructure Services

#### Option A: Using Docker Compose (Recommended)

```bash
# Start Kafka, Zookeeper, and MySQL
docker-compose up -d

# Or start everything including microservices
docker-compose -f docker-compose.yml up -d
```

#### Option B: Manual Setup

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

### 3. Build and Start Services

#### Using PowerShell Scripts (Windows)

```powershell
# Build all services
mvn clean package -DskipTests

# Start all services
.\start-services.ps1

# Or start individual services
.\start-services-simple.ps1
```

#### Manual Startup Order

1. **Eureka Server** (Service Discovery)
   ```bash
   cd eureka-server
   mvn spring-boot:run
   ```

2. **API Gateway**
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```

3. **Core Services** (in any order)
   ```bash
   # User Service
   cd user-service && mvn spring-boot:run
   
   # Restaurant Service
   cd restaurant-service && mvn spring-boot:run
   
   # Order Service
   cd order-service && mvn spring-boot:run
   
   # Notification Service
   cd notification-service && mvn spring-boot:run
   
   # Delivery Service
   cd delivery-service && mvn spring-boot:run
   
   # Payment Service
   cd payment-service && mvn spring-boot:run
   
   # Admin Service
   cd admin-service && mvn spring-boot:run
   ```

4. **Frontend**
   ```bash
   npm install
   npm run dev
   ```

## 🔧 Service Configuration

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8080 | API Gateway |
| User Service | 8082 | User Management |
| Restaurant Service | 8083 | Restaurant Management |
| Order Service | 8085 | Order Processing |
| Notification Service | 8089 | Email/SMS Notifications |
| Delivery Service | 8086 | Delivery Management |
| Payment Service | 8084 | Payment Processing |
| Admin Service | 8087 | Admin Panel |
| Frontend | 5173 | React Application |
| Kafka | 9092 | Message Broker |
| Zookeeper | 2181 | Kafka Coordination |
| MySQL | 3306 | Database |

### Environment Variables

#### Email Configuration (Notification Service)

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
```

#### Database Configuration

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/grubstack
    username: root
    password: password
```

#### Kafka Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: notification-service-group
      auto-offset-reset: earliest
```

## 📧 Email Setup

### Gmail SMTP Configuration

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update Configuration**:
   ```yaml
   spring:
     mail:
       username: your-email@gmail.com
       password: your-16-character-app-password
   ```

### Email Templates

The system includes HTML email templates for:
- Welcome emails for new users
- Order confirmation emails
- Delivery status updates
- Admin notifications

Templates are located in: `notification-service/src/main/resources/templates/email/`

## 🐳 Docker Configuration

### Docker Compose Files

- **`docker-compose.yml`**: Full stack with all services
- **`docker-compose-kafka.yml`**: Kafka and Zookeeper only
- **`docker-compose.prod.yml`**: Production configuration
- **`docker-compose.staging.yml`**: Staging environment

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d mysql kafka zookeeper

# View logs
docker-compose logs -f notification-service

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## 🔍 Monitoring and Debugging

### Service Health Checks

- **Eureka Dashboard**: http://localhost:8761
- **Kafka UI**: http://localhost:8080 (if enabled)
- **Service Health**: Each service has `/actuator/health` endpoint

### Logs and Debugging

```bash
# Check service logs
docker-compose logs -f <service-name>

# Check notification service specifically
docker-compose logs -f notification-service

# Test email functionality
curl -X POST "http://localhost:8089/notifications/test/email?email=test@example.com"
```

### Common Issues

1. **Email not sending**: Check Gmail app password and SMTP configuration
2. **Services not starting**: Verify Java version and port availability
3. **Kafka connection issues**: Ensure Zookeeper is running first
4. **Database connection**: Check MySQL is running and accessible

## 🧪 Testing

### API Testing

```bash
# Test user registration
curl -X POST "http://localhost:8082/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","roles":["CUSTOMER"]}'

# Test order placement
curl -X POST "http://localhost:8085/orders" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":1,"userId":1,"items":[{"menuItemId":1,"quantity":2,"priceCents":1299}]}'

# Test notification service
curl -X POST "http://localhost:8089/notifications/test/email?email=test@example.com"
```

### Frontend Testing

```bash
# Start frontend development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Structure

```
grub-stack-00/
├── admin-service/          # Admin management service
├── api-gateway/            # API Gateway (Spring Cloud Gateway)
├── common-lib/             # Shared libraries and DTOs
├── delivery-service/       # Delivery tracking service
├── eureka-server/          # Service discovery server
├── notification-service/   # Email/SMS notification service
├── order-service/          # Order processing service
├── payment-service/        # Payment processing service
├── restaurant-service/     # Restaurant management service
├── user-service/           # User management service
├── docker/                 # Docker configurations
├── scripts/                # Startup and deployment scripts
├── src/                    # Frontend React application
├── docker-compose.yml      # Full stack Docker configuration
├── docker-compose-kafka.yml # Kafka and Zookeeper only
└── README.md              # This file
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Configure production database**
3. **Set up production email service**
4. **Deploy using Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD Pipeline

The project includes deployment scripts in the `scripts/` directory:
- `deploy.ps1` / `deploy.sh`: Production deployment
- `stop.ps1` / `stop.sh`: Service shutdown

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review service logs
3. Test individual components
4. Create an issue with detailed logs

## 🔗 Useful Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀**