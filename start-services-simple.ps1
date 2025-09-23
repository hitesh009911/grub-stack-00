# GrubStack - Start All Services
Write-Host "🚀 Starting GrubStack Services..." -ForegroundColor Green

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
Write-Host "✅ JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow

Write-Host "`n📊 Starting Eureka Server..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00\eureka-server'; `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot'; mvn spring-boot:run" -WindowStyle Minimized
Start-Sleep -Seconds 20

Write-Host "`n🏪 Starting Restaurant Service..." -ForegroundColor Magenta  
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00\restaurant-service'; `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot'; mvn spring-boot:run" -WindowStyle Minimized
Start-Sleep -Seconds 15

Write-Host "`n👤 Starting Admin Service..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00\admin-service'; `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot'; mvn spring-boot:run" -WindowStyle Minimized
Start-Sleep -Seconds 15

Write-Host "`n🚚 Starting Delivery Service..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00\delivery-service'; `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot'; mvn spring-boot:run" -WindowStyle Minimized
Start-Sleep -Seconds 15

Write-Host "`n🌐 Starting API Gateway..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00\api-gateway'; `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot'; mvn spring-boot:run" -WindowStyle Minimized
Start-Sleep -Seconds 15

Write-Host "`n🎨 Starting Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-Command", "cd 'D:\grub-stack-00'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 10

Write-Host "`n🎉 All services started!" -ForegroundColor Green
Write-Host "`n📋 Service URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:     http://localhost:8081" -ForegroundColor White
Write-Host "   API Gateway:  http://localhost:8080" -ForegroundColor White
Write-Host "   Eureka:       http://localhost:8761" -ForegroundColor White
Write-Host "   Restaurant:   http://localhost:8083" -ForegroundColor White
Write-Host "   Admin:        http://localhost:8087" -ForegroundColor White
Write-Host "   Delivery:     http://localhost:8084" -ForegroundColor White

Write-Host "`n🔍 Checking service status in 30 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# Check all services
$services = @(
    @{Name="Eureka Server"; Port=8761},
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
