# Multi-stage build for Eureka Server
FROM eclipse-temurin:17-jdk as builder

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven git && rm -rf /var/lib/apt/lists/*

# Copy parent POM and common-lib first
COPY pom.xml .
COPY common-lib ./common-lib

# Copy service POM and download dependencies
COPY eureka-server/pom.xml ./eureka-server/
RUN mvn dependency:go-offline -B -f eureka-server/pom.xml

# Copy source code and build
COPY eureka-server/src ./eureka-server/src
RUN mvn clean package spring-boot:repackage -DskipTests -f eureka-server/pom.xml
RUN ls -la eureka-server/target/
RUN find eureka-server/target/ -name "*.jar" -exec echo "Found JAR: {}" \;
RUN find eureka-server/target/ -name "*.jar" -exec jar -tf {} \; | head -20

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built jar (look for the fat jar with dependencies)
COPY --from=builder /app/eureka-server/target/eureka-server-*.jar app.jar

# Expose port
EXPOSE 8761

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8761/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

