# Create test orders for restaurant dashboard testing
Write-Host "Creating test orders..." -ForegroundColor Green

# Test order 1 - PENDING
$order1 = @{
    restaurantId = 1
    userId = 6
    items = @(
        @{
            menuItemId = 1
            quantity = 2
            priceCents = 1500
        },
        @{
            menuItemId = 2
            quantity = 1
            priceCents = 2000
        }
    )
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:8080/api/orders" -Method POST -Body $order1 -ContentType "application/json"
    Write-Host "Order 1 created: $($response1.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Failed to create order 1: $($_.Exception.Message)" -ForegroundColor Red
}

# Test order 2 - PREPARING
$order2 = @{
    restaurantId = 1
    userId = 7
    items = @(
        @{
            menuItemId = 3
            quantity = 1
            priceCents = 1800
        }
    )
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:8080/api/orders" -Method POST -Body $order2 -ContentType "application/json"
    Write-Host "Order 2 created: $($response2.StatusCode)" -ForegroundColor Green
    
    # Update order 2 to PREPARING status
    if ($response2.StatusCode -eq 200) {
        $orderData = $response2.Content | ConvertFrom-Json
        $orderId = $orderData.id
        Invoke-WebRequest -Uri "http://localhost:8080/api/orders/$orderId/status?status=PREPARING" -Method POST
        Write-Host "Order 2 updated to PREPARING status" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to create order 2: $($_.Exception.Message)" -ForegroundColor Red
}

# Test order 3 - READY
$order3 = @{
    restaurantId = 1
    userId = 8
    items = @(
        @{
            menuItemId = 4
            quantity = 3
            priceCents = 1200
        }
    )
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:8080/api/orders" -Method POST -Body $order3 -ContentType "application/json"
    Write-Host "Order 3 created: $($response3.StatusCode)" -ForegroundColor Green
    
    # Update order 3 to READY status
    if ($response3.StatusCode -eq 200) {
        $orderData = $response3.Content | ConvertFrom-Json
        $orderId = $orderData.id
        Invoke-WebRequest -Uri "http://localhost:8080/api/orders/$orderId/status?status=READY" -Method POST
        Write-Host "Order 3 updated to READY status" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to create order 3: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test orders creation completed!" -ForegroundColor Green
