# GrubStack Docker Deployment Guide

This guide covers how to deploy the GrubStack application using Docker and Docker Compose.

## 🏗️ Architecture Overview

GrubStack is a microservices-based food delivery application with the following services:

- **Frontend**: React/TypeScript application served by Nginx
- **API Gateway**: Spring Cloud Gateway for routing requests
- **Eureka Server**: Service discovery and registration
- **User Service**: User management and authentication
- **Restaurant Service**: Restaurant and menu management
- **Order Service**: Order processing and management
- **Delivery Service**: Delivery agent management and tracking
- **Admin Service**: Admin user management
- **Notification Service**: Email and notification handling
- **Payment Service**: Payment processing
- **MySQL**: Primary database
- **Kafka**: Message broker for asynchronous communication

## 🚀 Quick Start

### Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)
- At least 4GB RAM available
- Ports 8080-8089, 8761, 3307, 9092, 2181 available

### Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/grub-stack-00.git
   cd grub-stack-00
   ```

2. **Start the development environment**
   ```bash
   # Make scripts executable
   chmod +x docker/*.sh
   
   # Start development environment
   ./docker/start-dev.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:8081
   - API Gateway: http://localhost:8080
   - Eureka Dashboard: http://localhost:8761
   - MySQL: localhost:3307

### Production Environment

1. **Set environment variables**
   ```bash
   export MYSQL_ROOT_PASSWORD=your-secure-password
   export MYSQL_PASSWORD=your-secure-password
   export SMTP_HOST=your-smtp-host
   export SMTP_USERNAME=your-email
   export SMTP_PASSWORD=your-password
   export JWT_SECRET=your-jwt-secret
   ```

2. **Start production environment**
   ```bash
   ./docker/start-prod.sh
   ```

## 📁 Docker Files Structure

```
grub-stack-00/
├── docker/
│   ├── admin-service/
│   │   └── Dockerfile
│   ├── api-gateway/
│   │   └── Dockerfile
│   ├── delivery-service/
│   │   └── Dockerfile
│   ├── eureka-server/
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   ├── notification-service/
│   │   └── Dockerfile
│   ├── order-service/
│   │   └── Dockerfile
│   ├── payment-service/
│   │   └── Dockerfile
│   ├── restaurant-service/
│   │   └── Dockerfile
│   ├── user-service/
│   │   └── Dockerfile
│   ├── start-dev.sh
│   ├── start-prod.sh
│   └── stop.sh
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-compose.staging.yml
└── docker-compose-kafka.yml
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `root` | Yes |
| `MYSQL_PASSWORD` | MySQL user password | `grubstack` | Yes |
| `MYSQL_DATABASE` | Database name | `grubstack` | No |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `development` | No |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` | Yes (for notifications) |
| `SMTP_USERNAME` | SMTP username | - | Yes (for notifications) |
| `SMTP_PASSWORD` | SMTP password | - | Yes (for notifications) |
| `JWT_SECRET` | JWT signing secret | - | Yes |

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 8081 | React application |
| API Gateway | 8080 | Request routing |
| Eureka Server | 8761 | Service discovery |
| User Service | 8082 | User management |
| Restaurant Service | 8083 | Restaurant management |
| Payment Service | 8084 | Payment processing |
| Order Service | 8085 | Order management |
| Notification Service | 8086 | Notifications |
| Admin Service | 8087 | Admin management |
| Delivery Service | 8089 | Delivery management |
| MySQL | 3307 | Database |
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordination |

## 🐳 Docker Commands

### Basic Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d service-name

# View logs
docker-compose logs -f service-name

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View running containers
docker-compose ps
```

### Development Commands

```bash
# Start development environment
./docker/start-dev.sh

# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart service-name

# Execute command in running container
docker-compose exec service-name bash
```

### Production Commands

```bash
# Start production environment
./docker/start-prod.sh

# Scale services
docker-compose -f docker-compose.prod.yml up --scale user-service=3 -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Monitoring and Health Checks

### Health Check Endpoints

- **Eureka Server**: http://localhost:8761/actuator/health
- **API Gateway**: http://localhost:8080/actuator/health
- **User Service**: http://localhost:8082/actuator/health
- **Restaurant Service**: http://localhost:8083/actuator/health
- **Order Service**: http://localhost:8085/actuator/health
- **Delivery Service**: http://localhost:8089/actuator/health
- **Admin Service**: http://localhost:8087/actuator/health
- **Notification Service**: http://localhost:8086/actuator/health

### Monitoring Commands

```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# Check logs for errors
docker-compose logs | grep ERROR

# Monitor specific service
docker-compose logs -f --tail=100 service-name
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check which ports are in use
   netstat -tulpn | grep :8080
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL container
   docker-compose logs mysql
   
   # Connect to MySQL
   docker-compose exec mysql mysql -u root -p
   ```

3. **Service startup failures**
   ```bash
   # Check service logs
   docker-compose logs service-name
   
   # Restart service
   docker-compose restart service-name
   ```

4. **Memory issues**
   ```bash
   # Check Docker memory usage
   docker system df
   
   # Clean up unused resources
   docker system prune -a
   ```

### Log Analysis

```bash
# View all logs
docker-compose logs

# Filter by service
docker-compose logs service-name

# Filter by log level
docker-compose logs | grep ERROR

# Follow logs in real-time
docker-compose logs -f
```

## 🔒 Security Considerations

### Production Security

1. **Change default passwords**
   ```bash
   export MYSQL_ROOT_PASSWORD=your-secure-password
   export MYSQL_PASSWORD=your-secure-password
   ```

2. **Use secrets management**
   ```bash
   # Create secrets
   echo "your-jwt-secret" | docker secret create jwt_secret -
   
   # Use in docker-compose.prod.yml
   secrets:
     - jwt_secret
   ```

3. **Enable HTTPS**
   - Configure SSL certificates in nginx.conf
   - Use Let's Encrypt for free certificates

4. **Network security**
   - Use Docker networks to isolate services
   - Configure firewall rules
   - Use reverse proxy for external access

## 📊 Performance Optimization

### Resource Limits

```yaml
# In docker-compose.prod.yml
services:
  user-service:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### Scaling Services

```bash
# Scale specific service
docker-compose -f docker-compose.prod.yml up --scale user-service=3 -d

# Scale multiple services
docker-compose -f docker-compose.prod.yml up --scale user-service=2 --scale restaurant-service=2 -d
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_agent_id ON deliveries(delivery_agent_id);
```

## 🚀 Deployment Strategies

### Blue-Green Deployment

1. **Deploy new version to green environment**
2. **Test green environment**
3. **Switch traffic to green environment**
4. **Decommission blue environment**

### Rolling Updates

```bash
# Update specific service
docker-compose -f docker-compose.prod.yml up --no-deps -d service-name

# Update all services
docker-compose -f docker-compose.prod.yml up -d
```

### Zero-Downtime Deployment

1. **Use load balancer with health checks**
2. **Deploy new version alongside old version**
3. **Gradually shift traffic to new version**
4. **Remove old version after verification**

## 📝 Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   # Update base images in Dockerfiles
   # Rebuild containers
   docker-compose build --no-cache
   ```

2. **Backup database**
   ```bash
   # Create backup
   docker-compose exec mysql mysqldump -u root -p grubstack > backup.sql
   
   # Restore backup
   docker-compose exec -T mysql mysql -u root -p grubstack < backup.sql
   ```

3. **Clean up resources**
   ```bash
   # Remove unused containers and images
   docker system prune -a
   
   # Remove unused volumes
   docker volume prune
   ```

### Monitoring

1. **Set up monitoring tools** (Prometheus, Grafana)
2. **Configure log aggregation** (ELK Stack)
3. **Set up alerts** for critical issues
4. **Monitor resource usage** and performance

## 📞 Support

For issues and questions:

1. **Check logs** for error messages
2. **Review this documentation**
3. **Check GitHub issues**
4. **Contact the development team**

---

**Happy Deploying! 🚀**
