# GrubStack - Start All Services (Fixed)
# This script starts all microservices in the correct order

Write-Host "🚀 Starting GrubStack Services..." -ForegroundColor Green

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
Write-Host "✅ JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow

# Function to start a service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Directory,
        [int]$Port,
        [int]$Delay = 15
    )
    
    Write-Host "🔄 Starting $ServiceName on port $Port..." -ForegroundColor Cyan
    
    # Start the service in background
    $command = "cd '$Directory'; `$env:JAVA_HOME = '$env:JAVA_HOME'; mvn spring-boot:run"
    Start-Process powershell -ArgumentList "-Command", $command -WindowStyle Minimized
    
    # Wait for service to start
    Write-Host "⏳ Waiting for $ServiceName to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds $Delay
    
    # Check if service is running
    $isRunning = netstat -an | Select-String ":$Port"
    if ($isRunning) {
        Write-Host "✅ $ServiceName is running on port $Port" -ForegroundColor Green
    } else {
        Write-Host "❌ $ServiceName failed to start on port $Port" -ForegroundColor Red
    }
}

# Start services in order
Write-Host "`n📊 Starting Eureka Server..." -ForegroundColor Magenta
Start-Service "Eureka Server" "eureka-server" 8761 20

Write-Host "`n🏪 Starting Restaurant Service..." -ForegroundColor Magenta  
Start-Service "Restaurant Service" "restaurant-service" 8083 15

Write-Host "`n👤 Starting User Service..." -ForegroundColor Magenta
Start-Service "User Service" "user-service" 8082 15

Write-Host "`n👤 Starting Admin Service..." -ForegroundColor Magenta
Start-Service "Admin Service" "admin-service" 8087 15

Write-Host "`n🚚 Starting Delivery Service..." -ForegroundColor Magenta
Start-Service "Delivery Service" "delivery-service" 8084 15

Write-Host "`n🌐 Starting API Gateway..." -ForegroundColor Magenta
Start-Service "API Gateway" "api-gateway" 8080 15

Write-Host "`n🎨 Starting Frontend..." -ForegroundColor Magenta
Write-Host "🔄 Starting Frontend on port 8081..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 10

Write-Host "`n🎉 All services started!" -ForegroundColor Green
Write-Host "`n📋 Service URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:     http://localhost:8081" -ForegroundColor White
Write-Host "   API Gateway:  http://localhost:8080" -ForegroundColor White
Write-Host "   Eureka:       http://localhost:8761" -ForegroundColor White
Write-Host "   User:         http://localhost:8082" -ForegroundColor White
Write-Host "   Restaurant:   http://localhost:8083" -ForegroundColor White
Write-Host "   Admin:        http://localhost:8087" -ForegroundColor White
Write-Host "   Delivery:     http://localhost:8084" -ForegroundColor White

Write-Host "`n🔍 Checking service status..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check all services
$services = @(
    @{Name="Eureka Server"; Port=8761},
    @{Name="User Service"; Port=8082},
    @{Name="Restaurant Service"; Port=8083},
    @{Name="Admin Service"; Port=8087},
    @{Name="Delivery Service"; Port=8084},
    @{Name="API Gateway"; Port=8080},
    @{Name="Frontend"; Port=8081}
)

Write-Host "`n📊 Service Status:" -ForegroundColor Yellow
foreach ($service in $services) {
    $isRunning = netstat -an | Select-String ":$($service.Port)"
    if ($isRunning) {
        Write-Host "   ✅ $($service.Name) - Running on port $($service.Port)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($service.Name) - Not running on port $($service.Port)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Ready to use GrubStack!" -ForegroundColor Green
Write-Host "   Open http://localhost:8081 in your browser" -ForegroundColor White





