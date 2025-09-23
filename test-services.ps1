# Test GrubStack Services
Write-Host "Testing GrubStack Services..." -ForegroundColor Green

# Test Eureka Server
Write-Host "`n1. Testing Eureka Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8761" -TimeoutSec 5
    Write-Host "✓ Eureka Server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Eureka Server not responding" -ForegroundColor Red
}

# Test API Gateway
Write-Host "`n2. Testing API Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/restaurants" -TimeoutSec 5
    Write-Host "✓ API Gateway is running - Found $($response.Count) restaurants" -ForegroundColor Green
    $response | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor White }
} catch {
    Write-Host "✗ API Gateway not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Restaurant Service directly
Write-Host "`n3. Testing Restaurant Service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8083/restaurants" -TimeoutSec 5
    Write-Host "✓ Restaurant Service is running - Found $($response.Count) restaurants" -ForegroundColor Green
} catch {
    Write-Host "✗ Restaurant Service not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Menu Items
Write-Host "`n4. Testing Menu Items..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8083/restaurants/1/menu" -TimeoutSec 5
    Write-Host "✓ Menu Items working - Found $($response.Count) items" -ForegroundColor Green
    $response | ForEach-Object { Write-Host "  - $($_.name): $($_.priceCents / 100)" -ForegroundColor White }
} catch {
    Write-Host "✗ Menu Items not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test PUT operation
Write-Host "`n5. Testing PUT operation..." -ForegroundColor Yellow
try {
    $testData = @{
        name = "Test Item"
        description = "Test Description"
        priceCents = 1000
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8083/restaurants/menu/1" -Method PUT -Body $testData -ContentType "application/json" -TimeoutSec 5
    Write-Host "✓ PUT operation working" -ForegroundColor Green
} catch {
    Write-Host "✗ PUT operation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
