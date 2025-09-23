-- GrubStack Database Initialization Script
-- This script sets up the database schema for all microservices

-- Create databases for each service (if needed)
CREATE DATABASE IF NOT EXISTS grubstack_user;
CREATE DATABASE IF NOT EXISTS grubstack_restaurant;
CREATE DATABASE IF NOT EXISTS grubstack_order;
CREATE DATABASE IF NOT EXISTS grubstack_delivery;
CREATE DATABASE IF NOT EXISTS grubstack_admin;
CREATE DATABASE IF NOT EXISTS grubstack_notification;

-- Use the main database
USE grubstack;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cuisine VARCHAR(50),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    owner_name VARCHAR(100),
    owner_email VARCHAR(100),
    owner_phone VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 0.0,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE') DEFAULT 'PENDING',
    delivery_status ENUM('ONLINE', 'OFFLINE') DEFAULT 'OFFLINE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    total_cents INT NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_cents INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    delivery_agent_id BIGINT,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    assigned_at TIMESTAMP NULL,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create delivery_agents table
CREATE TABLE IF NOT EXISTS delivery_agents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status ENUM('AVAILABLE', 'BUSY', 'OFFLINE') DEFAULT 'OFFLINE',
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ORDER_UPDATE', 'DELIVERY_UPDATE', 'RESTAURANT_UPDATE', 'SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address) VALUES
('john_doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'John', 'Doe', '+1234567890', '123 Main St, City, State'),
('jane_smith', 'jane@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Jane', 'Smith', '+1234567891', '456 Oak Ave, City, State');

INSERT INTO restaurants (name, description, cuisine, address, phone, email, owner_name, owner_email, owner_phone, rating, status, delivery_status) VALUES
('Sushi Place', 'Fresh sushi and rolls made with the finest ingredients', 'Japanese', '123 Ocean Ave, Mumbai, Maharashtra 400001', '+91 98765 43210', 'info@sushiplace.com', 'Hiroshi Tanaka', 'hiroshi@sushiplace.com', '+91 98765 43211', 4.5, 'ACTIVE', 'ONLINE'),
('Pasta Corner', 'Authentic Italian pasta and pizza', 'Italian', '456 Rome St, Mumbai, Maharashtra 400002', '+91 98765 43212', 'info@pastacorner.com', 'Marco Rossi', 'marco@pastacorner.com', '+91 98765 43213', 4.2, 'ACTIVE', 'ONLINE');

INSERT INTO menu_items (restaurant_id, name, description, price_cents) VALUES
(1, 'California Roll', 'Crab, avocado, and cucumber roll', 1200),
(1, 'Salmon Nigiri', 'Fresh salmon over sushi rice', 1500),
(1, 'Dragon Roll', 'Eel, cucumber, and avocado roll', 1800),
(2, 'Margherita Pizza', 'Classic tomato and mozzarella pizza', 1200),
(2, 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 1500),
(2, 'Tiramisu', 'Classic Italian dessert', 800);

INSERT INTO delivery_agents (name, email, phone, status) VALUES
('Mike Johnson', 'mike@delivery.com', '+91 98765 43220', 'AVAILABLE'),
('Sarah Wilson', 'sarah@delivery.com', '+91 98765 43221', 'AVAILABLE');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_delivery_status ON restaurants(delivery_status);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_agent_id ON deliveries(delivery_agent_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

