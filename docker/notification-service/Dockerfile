# Multi-stage build for Notification Service
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven git && rm -rf /var/lib/apt/lists/*

# Copy parent POM and common-lib first
COPY pom.xml .
COPY common-lib ./common-lib

# Copy service POM and download dependencies
COPY notification-service/pom.xml ./notification-service/
RUN mvn dependency:go-offline -B -f notification-service/pom.xml

# Copy source code and build
COPY notification-service/src ./notification-service/src
RUN mvn clean package spring-boot:repackage -DskipTests -f notification-service/pom.xml

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built jar
COPY --from=builder /app/notification-service/target/*.jar app.jar

# Expose port
EXPOSE 8086

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8086/notifications/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

