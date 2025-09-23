# 🚀 Kafka & Zookeeper Setup Guide

This guide provides detailed instructions for setting up Apache Kafka and Zookeeper for the GrubStack microservices platform.

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 2181, 9092, and 8080 available

## 🐳 Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

```bash
# Start Kafka and Zookeeper
docker-compose -f docker-compose-kafka.yml up -d

# Verify services are running
docker-compose -f docker-compose-kafka.yml ps
```

### Option 2: Manual Docker Commands

```bash
# Start Zookeeper
docker run -d --name zookeeper \
  -p 2181:2181 \
  -e ZOOKEEPER_CLIENT_PORT=2181 \
  -e ZOOKEEPER_TICK_TIME=2000 \
  confluentinc/cp-zookeeper:7.4.0

# Start Kafka
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
  confluentinc/cp-kafka:7.4.0

# Start Kafka UI (Optional)
docker run -d --name kafka-ui \
  -p 8080:8080 \
  -e KAFKA_CLUSTERS_0_NAME=local \
  -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=localhost:9092 \
  provectuslabs/kafka-ui:latest
```

## 🔧 Configuration Details

### Zookeeper Configuration

```yaml
# docker-compose-kafka.yml
zookeeper:
  image: confluentinc/cp-zookeeper:7.4.0
  hostname: zookeeper
  container_name: zookeeper
  ports:
    - "2181:2181"
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
    ZOOKEEPER_TICK_TIME: 2000
```

**Key Parameters:**
- `ZOOKEEPER_CLIENT_PORT`: Port for client connections
- `ZOOKEEPER_TICK_TIME`: Time unit for Zookeeper (2 seconds)

### Kafka Configuration

```yaml
# docker-compose-kafka.yml
kafka:
  image: confluentinc/cp-kafka:7.4.0
  hostname: kafka
  container_name: kafka
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"
    - "9101:9101"
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
    KAFKA_JMX_PORT: 9101
    KAFKA_JMX_HOSTNAME: localhost
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
```

**Key Parameters:**
- `KAFKA_BROKER_ID`: Unique identifier for the Kafka broker
- `KAFKA_ZOOKEEPER_CONNECT`: Connection string to Zookeeper
- `KAFKA_ADVERTISED_LISTENERS`: Addresses clients use to connect
- `KAFKA_AUTO_CREATE_TOPICS_ENABLE`: Automatically create topics when needed

### Kafka UI Configuration

```yaml
# docker-compose-kafka.yml
kafka-ui:
  image: provectuslabs/kafka-ui:latest
  container_name: kafka-ui
  depends_on:
    - kafka
  ports:
    - "8080:8080"
  environment:
    KAFKA_CLUSTERS_0_NAME: local
    KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
```

## 🔍 Verification and Testing

### 1. Check Service Status

```bash
# Check if containers are running
docker ps | grep -E "(kafka|zookeeper)"

# Check logs
docker logs kafka
docker logs zookeeper
```

### 2. Test Kafka Connectivity

```bash
# Create a test topic
docker exec kafka kafka-topics --create \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

# List topics
docker exec kafka kafka-topics --list \
  --bootstrap-server localhost:9092

# Produce a test message
docker exec kafka kafka-console-producer \
  --topic test-topic \
  --bootstrap-server localhost:9092

# Consume messages (in another terminal)
docker exec kafka kafka-console-consumer \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

### 3. Access Kafka UI

Open your browser and navigate to: http://localhost:8080

You should see:
- Kafka cluster information
- Topics list
- Consumer groups
- Message browser

## 🔧 Spring Boot Integration

### Application Configuration

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: your-service-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "com.yourpackage.model"
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

### Producer Example

```java
@Service
public class KafkaProducerService {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    public void sendMessage(String topic, String key, Object message) {
        kafkaTemplate.send(topic, key, message);
    }
}
```

### Consumer Example

```java
@Service
public class KafkaConsumerService {
    
    @KafkaListener(topics = "your-topic", groupId = "your-group")
    public void consumeMessage(String message) {
        System.out.println("Received message: " + message);
    }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Kafka won't start**
   ```bash
   # Check if Zookeeper is running
   docker ps | grep zookeeper
   
   # Check Zookeeper logs
   docker logs zookeeper
   ```

2. **Connection refused errors**
   ```bash
   # Verify ports are available
   netstat -an | grep -E "(2181|9092)"
   
   # Check firewall settings
   ```

3. **Topic creation fails**
   ```bash
   # Check Kafka logs
   docker logs kafka
   
   # Verify Zookeeper connection
   docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
   ```

4. **Consumer not receiving messages**
   ```bash
   # Check consumer group status
   docker exec kafka kafka-consumer-groups \
     --bootstrap-server localhost:9092 \
     --describe --group your-group-id
   ```

### Performance Tuning

```yaml
# For production environments
environment:
  KAFKA_HEAP_OPTS: "-Xmx1G -Xms1G"
  KAFKA_LOG_RETENTION_HOURS: 168
  KAFKA_LOG_SEGMENT_BYTES: 1073741824
  KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
```

## 🔄 Maintenance

### Backup and Recovery

```bash
# Backup Kafka data (if using volumes)
docker run --rm -v kafka-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/kafka-backup.tar.gz /data

# Restore Kafka data
docker run --rm -v kafka-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/kafka-backup.tar.gz -C /
```

### Monitoring

```bash
# Check broker metrics
docker exec kafka kafka-log-dirs \
  --bootstrap-server localhost:9092 \
  --describe

# Monitor consumer lag
docker exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe --all-groups
```

## 🛑 Shutdown

```bash
# Stop all Kafka services
docker-compose -f docker-compose-kafka.yml down

# Or stop individual containers
docker stop kafka kafka-ui zookeeper
docker rm kafka kafka-ui zookeeper
```

## 📚 Additional Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Platform Documentation](https://docs.confluent.io/)
- [Kafka UI Documentation](https://docs.kafka-ui.provectus.io/)
- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/docs/current/reference/html/)

---

**Happy Messaging! 📨**
