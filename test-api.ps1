# Test API endpoints
Write-Host "Testing API Gateway..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/restaurants" -Method GET
    Write-Host "API Gateway is running. Found $($response.Count) restaurants"
    $response | ForEach-Object { Write-Host "- $($_.name)" }
} catch {
    Write-Host "API Gateway not responding: $($_.Exception.Message)"
}

Write-Host "`nTesting Restaurant Service directly..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8083/restaurants" -Method GET
    Write-Host "Restaurant Service is running. Found $($response.Count) restaurants"
    $response | ForEach-Object { Write-Host "- $($_.name)" }
} catch {
    Write-Host "Restaurant Service not responding: $($_.Exception.Message)"
}

Write-Host "`nTesting Menu Items for Restaurant 1..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8083/restaurants/1/menu" -Method GET
    Write-Host "Found $($response.Count) menu items for restaurant 1"
    $response | ForEach-Object { Write-Host "- $($_.name): $($_.priceCents / 100)" }
} catch {
    Write-Host "Menu items not responding: $($_.Exception.Message)"
}
