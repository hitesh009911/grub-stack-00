# Multi-stage build for Payment Service
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven git && rm -rf /var/lib/apt/lists/*

# Copy parent POM and common-lib first
COPY pom.xml .
COPY common-lib ./common-lib

# Copy service POM and download dependencies
COPY payment-service/pom.xml ./payment-service/
RUN mvn dependency:go-offline -B -f payment-service/pom.xml

# Copy source code and build
COPY payment-service/src ./payment-service/src
RUN mvn clean package spring-boot:repackage -DskipTests -f payment-service/pom.xml

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built jar
COPY --from=builder /app/payment-service/target/*.jar app.jar

# Expose port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8084/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

