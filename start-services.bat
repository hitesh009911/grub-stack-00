@echo off
echo Starting GrubStack Services...

REM Set JAVA_HOME
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"

timeout /t 20 /nobreak > nul

echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

timeout /t 15 /nobreak > nul

echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"

timeout /t 15 /nobreak > nul

echo Starting Restaurant Service...
start "Restaurant Service" cmd /k "cd restaurant-service && mvn spring-boot:run"

timeout /t 15 /nobreak > nul

echo Starting Delivery Service...
start "Delivery Service" cmd /k "cd delivery-service && mvn spring-boot:run"

timeout /t 15 /nobreak > nul

echo Starting Admin Service...
start "Admin Service" cmd /k "cd admin-service && mvn spring-boot:run"

timeout /t 15 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo All services started!
echo.
echo Service URLs:
echo   Frontend:     http://localhost:8081
echo   API Gateway:  http://localhost:8080
echo   Eureka:       http://localhost:8761
echo   User:         http://localhost:8082
echo   Restaurant:   http://localhost:8083
echo   Admin:        http://localhost:8087
echo   Delivery:     http://localhost:8084
echo.
echo Open http://localhost:8081 in your browser
pause





