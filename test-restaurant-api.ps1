# Test restaurant API
$body = @{
    name = "Test Restaurant"
    description = "Test Description"
    cuisine = "Test Cuisine"
    address = "Test Address"
    phone = "1234567890"
    email = "test@example.com"
    ownerName = "Test Owner"
    ownerEmail = "test@example.com"
    ownerPhone = "1234567890"
    rating = 0.0
    status = "PENDING"
} | ConvertTo-Json

Write-Host "Testing restaurant service directly on port 8083..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083/restaurants" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}

Write-Host "`nTesting API Gateway on port 8080..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/restaurants" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}
