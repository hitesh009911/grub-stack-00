# Test minimal restaurant API
$body = @{
    name = "Test Restaurant"
} | ConvertTo-Json

Write-Host "Testing minimal restaurant creation..."
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083/restaurants" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    }
}
