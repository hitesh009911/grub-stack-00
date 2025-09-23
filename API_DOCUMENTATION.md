# 📚 GrubStack API Documentation

This document provides comprehensive API documentation for all microservices in the GrubStack platform.

## 🔗 Base URLs

| Service | Port | Base URL |
|---------|------|----------|
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 8082 | http://localhost:8082 |
| Restaurant Service | 8083 | http://localhost:8083 |
| Order Service | 8085 | http://localhost:8085 |
| Notification Service | 8089 | http://localhost:8089 |
| Delivery Service | 8086 | http://localhost:8086 |
| Payment Service | 8084 | http://localhost:8084 |
| Admin Service | 8087 | http://localhost:8087 |

## 👤 User Service API

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

## 🍕 Restaurant Service API

### Restaurants

#### Get All Restaurants
```http
GET /restaurants
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "cuisineType": "Italian",
    "address": "123 Main St",
    "phone": "+1-555-0123",
    "email": "info@pizzapalace.com",
    "status": "ACTIVE",
    "rating": 4.5,
    "deliveryTime": 30,
    "deliveryFee": 299
  }
]
```

#### Get Restaurant by ID
```http
GET /restaurants/{id}
```

#### Get Restaurant Menu
```http
GET /restaurants/{id}/menu
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Margherita Pizza",
    "description": "Classic tomato and mozzarella",
    "price": 1299,
    "category": "Pizza",
    "available": true,
    "imageUrl": "https://example.com/pizza.jpg"
  }
]
```

## 📦 Order Service API

### Orders

#### Place Order
```http
POST /orders
Content-Type: application/json

{
  "restaurantId": 1,
  "userId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "priceCents": 1299
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "restaurantId": 1,
  "userId": 1,
  "status": "PENDING",
  "totalCents": 2598,
  "createdAt": "2025-01-27T10:30:00Z",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "priceCents": 1299
    }
  ]
}
```

#### Get Order by ID
```http
GET /orders/{id}
```

#### Update Order Status
```http
POST /orders/{id}/status?status=CONFIRMED
```

#### Get User Orders
```http
GET /orders/user/{userId}
```

## 📧 Notification Service API

### Notifications

#### Send Notification
```http
POST /notifications/send
Content-Type: application/json

{
  "type": "WELCOME_EMAIL",
  "channel": "EMAIL",
  "recipient": "user@example.com",
  "subject": "Welcome to GrubStack!",
  "message": "Welcome to our platform",
  "notificationId": "welcome-123",
  "templateId": "welcome-email",
  "templateData": {
    "userName": "John Doe",
    "userEmail": "user@example.com",
    "registrationDate": "2025-01-27"
  },
  "priority": "NORMAL"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Notification sent successfully",
  "notificationId": "welcome-123"
}
```

#### Test Email
```http
POST /notifications/test/email?email=test@example.com
```

**Response:**
```json
{
  "status": "success",
  "message": "Test email sent successfully to test@example.com"
}
```

#### Test SMTP Connection
```http
POST /notifications/test/smtp
```

**Response:**
```json
{
  "status": "success",
  "message": "SMTP connection test successful"
}
```

#### Get Notification Statistics
```http
GET /notifications/stats
```

**Response:**
```json
{
  "total": 47,
  "pending": 0,
  "sent": 47,
  "delivered": 0,
  "failed": 0
}
```

#### Get Notifications by Status
```http
GET /notifications/status/SENT
GET /notifications/status/FAILED
GET /notifications/status/PENDING
```

#### Get Notifications by User
```http
GET /notifications/user/{userId}
```

## 🚚 Delivery Service API

### Deliveries

#### Create Delivery
```http
POST /deliveries
Content-Type: application/json

{
  "orderId": 1,
  "customerId": 1,
  "pickupAddress": "123 Restaurant St",
  "deliveryAddress": "456 Customer Ave",
  "estimatedDeliveryTime": "2025-01-27T11:00:00Z"
}
```

#### Update Delivery Status
```http
PUT /deliveries/{id}/status
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "deliveryAgentId": 1,
  "notes": "On the way"
}
```

#### Get Delivery by ID
```http
GET /deliveries/{id}
```

#### Get Deliveries by Status
```http
GET /deliveries/status/PENDING
```

## 💳 Payment Service API

### Payments

#### Process Payment
```http
POST /payments
Content-Type: application/json

{
  "orderId": 1,
  "amount": 2598,
  "paymentMethod": "CREDIT_CARD",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "orderId": 1,
  "amount": 2598,
  "status": "COMPLETED",
  "transactionId": "txn_123456789",
  "paymentMethod": "CREDIT_CARD",
  "processedAt": "2025-01-27T10:35:00Z"
}
```

#### Get Payment by ID
```http
GET /payments/{id}
```

#### Get Payment by Order
```http
GET /payments/order/{orderId}
```

## 👨‍💼 Admin Service API

### Admin Management

#### Create Admin User
```http
POST /admin/users
Content-Type: application/json

{
  "email": "admin@grubstack.com",
  "password": "admin123",
  "fullName": "Admin User",
  "role": "SUPER_ADMIN"
}
```

#### Get All Admins
```http
GET /admin/users
```

#### Approve Restaurant
```http
POST /admin/restaurants/{id}/approve
```

#### Reject Restaurant
```http
POST /admin/restaurants/{id}/reject
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```

## 🔍 Service Discovery (Eureka)

### Eureka Dashboard
- **URL**: http://localhost:8761
- **Description**: Service discovery dashboard showing all registered services

### Registered Services
- API-GATEWAY
- USER-SERVICE
- RESTAURANT-SERVICE
- ORDER-SERVICE
- NOTIFICATION-SERVICE
- DELIVERY-SERVICE
- PAYMENT-SERVICE
- ADMIN-SERVICE

## 📊 Health Checks

### Service Health Endpoints
```http
GET /actuator/health
```

**Response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "kafka": {
      "status": "UP"
    }
  }
}
```

### Service Metrics
```http
GET /actuator/metrics
```

## 🚨 Error Responses

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "timestamp": "2025-01-27T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "path": "/api/orders"
}
```

## 🔐 Authentication & Authorization

### JWT Token (Future Implementation)
```http
Authorization: Bearer <jwt-token>
```

### Role-Based Access
- **CUSTOMER**: Can place orders, view restaurants
- **RESTAURANT_OWNER**: Can manage restaurant, view orders
- **DELIVERY_AGENT**: Can view and update delivery status
- **ADMIN**: Full system access

## 📝 Request/Response Examples

### Complete Order Flow

1. **Register User**
```bash
curl -X POST "http://localhost:8082/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","roles":["CUSTOMER"]}'
```

2. **Get Restaurants**
```bash
curl "http://localhost:8083/restaurants"
```

3. **Place Order**
```bash
curl -X POST "http://localhost:8085/orders" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":1,"userId":1,"items":[{"menuItemId":1,"quantity":2,"priceCents":1299}]}'
```

4. **Process Payment**
```bash
curl -X POST "http://localhost:8084/payments" \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"amount":2598,"paymentMethod":"CREDIT_CARD","cardDetails":{"cardNumber":"4111111111111111","expiryMonth":12,"expiryYear":2025,"cvv":"123"}}'
```

5. **Track Delivery**
```bash
curl "http://localhost:8086/deliveries/1"
```

## 🧪 Testing Endpoints

### Test Email Notification
```bash
curl -X POST "http://localhost:8089/notifications/test/email?email=test@example.com"
```

### Test SMTP Connection
```bash
curl -X POST "http://localhost:8089/notifications/test/smtp"
```

### Check Service Health
```bash
curl "http://localhost:8082/actuator/health"
curl "http://localhost:8089/actuator/health"
```

---

**Happy API Testing! 🚀**
