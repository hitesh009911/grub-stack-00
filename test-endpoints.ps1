# Test API endpoints
Write-Host "Testing API endpoints..."

# Wait for services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 10

# Test Eureka Server
Write-Host "`n1. Testing Eureka Server..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8761" -Method GET -UseBasicParsing
    Write-Host "Eureka Server: OK (Status: $($response.StatusCode))"
} catch {
    Write-Host "Eureka Server: FAILED - $($_.Exception.Message)"
}

# Test API Gateway
Write-Host "`n2. Testing API Gateway..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -UseBasicParsing
    Write-Host "API Gateway: OK (Status: $($response.StatusCode))"
} catch {
    Write-Host "API Gateway: FAILED - $($_.Exception.Message)"
}

# Test Restaurant Service
Write-Host "`n3. Testing Restaurant Service..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083/restaurants" -Method GET -UseBasicParsing
    Write-Host "Restaurant Service: OK (Status: $($response.StatusCode))"
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..."
} catch {
    Write-Host "Restaurant Service: FAILED - $($_.Exception.Message)"
}

# Test Order Service
Write-Host "`n4. Testing Order Service..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/orders" -Method GET -UseBasicParsing
    Write-Host "Order Service: OK (Status: $($response.StatusCode))"
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..."
} catch {
    Write-Host "Order Service: FAILED - $($_.Exception.Message)"
}

# Test Order Service Restaurant Endpoint
Write-Host "`n5. Testing Order Service Restaurant Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/orders/restaurant/1" -Method GET -UseBasicParsing
    Write-Host "Order Service Restaurant Endpoint: OK (Status: $($response.StatusCode))"
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..."
} catch {
    Write-Host "Order Service Restaurant Endpoint: FAILED - $($_.Exception.Message)"
}

# Test API Gateway Orders
Write-Host "`n6. Testing API Gateway Orders..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/orders" -Method GET -UseBasicParsing
    Write-Host "API Gateway Orders: OK (Status: $($response.StatusCode))"
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..."
} catch {
    Write-Host "API Gateway Orders: FAILED - $($_.Exception.Message)"
}

# Test API Gateway Restaurant Orders
Write-Host "`n7. Testing API Gateway Restaurant Orders..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/orders/restaurant/1" -Method GET -UseBasicParsing
    Write-Host "API Gateway Restaurant Orders: OK (Status: $($response.StatusCode))"
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..."
} catch {
    Write-Host "API Gateway Restaurant Orders: FAILED - $($_.Exception.Message)"
}

Write-Host "`nTest completed!"
