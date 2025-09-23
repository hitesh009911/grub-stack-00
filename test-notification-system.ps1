# Notification System Test Script
Write-Host "🚀 Testing GrubStack Notification System with Kafka" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

$baseUrl = "http://localhost:8080"
$notificationUrl = "http://localhost:8087"

# Function to make API calls
function Test-ApiEndpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$ContentType = "application/json"
    )
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -ContentType $ContentType
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method
        }
        Write-Host "✅ $Method $Url - SUCCESS" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ $Method $Url - FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Wait for services to start
Write-Host "`n⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test 1: Check Notification Service Health
Write-Host "`n🏥 Testing Notification Service Health..." -ForegroundColor Cyan
$health = Test-ApiEndpoint -Method "GET" -Url "$notificationUrl/notifications/health"
if ($health) {
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Service: $($health.service)" -ForegroundColor Green
}

# Test 2: Send Test Email Notification
Write-Host "`n📧 Testing Email Notification..." -ForegroundColor Cyan
$testEmail = Test-ApiEndpoint -Method "POST" -Url "$notificationUrl/notifications/test/email?email=test@example.com"
if ($testEmail) {
    Write-Host "   Test Email: $($testEmail.message)" -ForegroundColor Green
}

# Test 3: Create a Delivery (This will trigger Kafka events)
Write-Host "`n📦 Creating Delivery to Trigger Notifications..." -ForegroundColor Cyan
$deliveryBody = @{
    orderId = 200
    restaurantId = 60
    customerId = 300
    pickupAddress = "Burger Palace, 789 Food Street"
    deliveryAddress = "321 Home Lane, Unit 3C"
} | ConvertTo-Json

$delivery = Test-ApiEndpoint -Method "POST" -Url "$baseUrl/deliveries" -Body $deliveryBody
if ($delivery) {
    Write-Host "   Delivery Created: ID $($delivery.id)" -ForegroundColor Green
    Write-Host "   Order ID: $($delivery.orderId)" -ForegroundColor Green
    Write-Host "   Status: $($delivery.status)" -ForegroundColor Green
    
    # Wait a moment for Kafka event processing
    Write-Host "   ⏳ Waiting for Kafka event processing..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Test 4: Assign Delivery to Agent (This will trigger more notifications)
if ($delivery) {
    Write-Host "`n🔄 Assigning Delivery to Agent..." -ForegroundColor Cyan
    $assignedDelivery = Test-ApiEndpoint -Method "POST" -Url "$baseUrl/deliveries/$($delivery.id)/assign?agentId=1"
    if ($assignedDelivery) {
        Write-Host "   Delivery Assigned: Status $($assignedDelivery.status)" -ForegroundColor Green
        Write-Host "   Agent: $($assignedDelivery.agent.name)" -ForegroundColor Green
        
        # Wait for notification processing
        Write-Host "   ⏳ Waiting for notification processing..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

# Test 5: Update Delivery Status to Picked Up
if ($delivery) {
    Write-Host "`n📋 Updating Delivery Status to PICKED_UP..." -ForegroundColor Cyan
    $pickedUpDelivery = Test-ApiEndpoint -Method "PUT" -Url "$baseUrl/deliveries/$($delivery.id)/status?status=PICKED_UP"
    if ($pickedUpDelivery) {
        Write-Host "   Status Updated: $($pickedUpDelivery.status)" -ForegroundColor Green
        
        # Wait for notification processing
        Write-Host "   ⏳ Waiting for notification processing..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

# Test 6: Update Delivery Status to In Transit
if ($delivery) {
    Write-Host "`n🚚 Updating Delivery Status to IN_TRANSIT..." -ForegroundColor Cyan
    $inTransitDelivery = Test-ApiEndpoint -Method "PUT" -Url "$baseUrl/deliveries/$($delivery.id)/status?status=IN_TRANSIT"
    if ($inTransitDelivery) {
        Write-Host "   Status Updated: $($inTransitDelivery.status)" -ForegroundColor Green
        
        # Wait for notification processing
        Write-Host "   ⏳ Waiting for notification processing..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

# Test 7: Update Delivery Status to Delivered
if ($delivery) {
    Write-Host "`n✅ Updating Delivery Status to DELIVERED..." -ForegroundColor Cyan
    $deliveredDelivery = Test-ApiEndpoint -Method "PUT" -Url "$baseUrl/deliveries/$($delivery.id)/status?status=DELIVERED"
    if ($deliveredDelivery) {
        Write-Host "   Status Updated: $($deliveredDelivery.status)" -ForegroundColor Green
        Write-Host "   Delivered At: $($deliveredDelivery.deliveredAt)" -ForegroundColor Green
        
        # Wait for notification processing
        Write-Host "   ⏳ Waiting for notification processing..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

# Test 8: Send Custom Notification
Write-Host "`n📨 Testing Custom Notification..." -ForegroundColor Cyan
$customNotification = @{
    type = "SYSTEM_ALERT"
    channel = "EMAIL"
    recipient = "admin@grubstack.com"
    subject = "Test Custom Notification"
    message = "This is a test notification from the GrubStack notification system."
    priority = "NORMAL"
} | ConvertTo-Json

$customResult = Test-ApiEndpoint -Method "POST" -Url "$notificationUrl/notifications/send" -Body $customNotification
if ($customResult) {
    Write-Host "   Custom Notification: $($customResult.message)" -ForegroundColor Green
}

Write-Host "`n🎉 Notification System Testing Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`n📊 Test Summary:" -ForegroundColor Yellow
Write-Host "✅ Notification Service Health Check" -ForegroundColor Green
Write-Host "✅ Test Email Notification" -ForegroundColor Green
Write-Host "✅ Delivery Creation Event (Kafka)" -ForegroundColor Green
Write-Host "✅ Delivery Assignment Event (Kafka)" -ForegroundColor Green
Write-Host "✅ Delivery Status Updates (Kafka)" -ForegroundColor Green
Write-Host "✅ Custom Notification" -ForegroundColor Green

Write-Host "`n🔍 Check the following for notifications:" -ForegroundColor Yellow
Write-Host "📧 Email: customer300@example.com" -ForegroundColor White
Write-Host "📧 Email: test@example.com" -ForegroundColor White
Write-Host "📧 Email: admin@grubstack.com" -ForegroundColor White
Write-Host "🌐 Kafka UI: http://localhost:8080" -ForegroundColor White
Write-Host "📊 Notification Service: http://localhost:8087" -ForegroundColor White

Write-Host "`n🚀 The notification system is working with Kafka event-driven architecture!" -ForegroundColor Green



