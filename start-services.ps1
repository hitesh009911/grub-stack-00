# GrubStack Services Startup Script
Write-Host "Starting GrubStack Services..." -ForegroundColor Green

# Function to find Java installation
function Find-JavaHome {
    $possiblePaths = @(
        "C:\Program Files\Java\jdk-21",
        "C:\Program Files\Java\jdk-17", 
        "C:\Program Files\Java\jdk-11",
        "C:\Program Files\Eclipse Adoptium\jdk-21*",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Eclipse Adoptium\jdk-11*"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Try to find from PATH
    try {
        $javaPath = (Get-Command java -ErrorAction Stop).Source
        $javaHome = Split-Path (Split-Path $javaPath -Parent) -Parent
        return $javaHome
    } catch {
        return $null
    }
}

# Set up Java environment
Write-Host "Setting up Java environment..." -ForegroundColor Yellow
$javaHome = Find-JavaHome

if ($javaHome -and (Test-Path $javaHome)) {
    $env:JAVA_HOME = $javaHome
    $env:PATH = "$javaHome\bin;$env:PATH"
    Write-Host "JAVA_HOME set to: $javaHome" -ForegroundColor Green
} else {
    Write-Host "Java not found! Please install Java 17 or 21 and try again." -ForegroundColor Red
    Write-Host "You can download Java from: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}

# Verify Java is working
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "Java version: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "Java verification failed!" -ForegroundColor Red
    exit 1
}

# Start services in background
Write-Host "`nStarting Eureka Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd eureka-server; mvn spring-boot:run" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host "Starting Restaurant Service..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd restaurant-service; mvn spring-boot:run" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host "Starting API Gateway..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; mvn spring-boot:run" -WindowStyle Normal

Write-Host "`nAll services are starting up..." -ForegroundColor Green
Write-Host "Please wait 30-60 seconds for all services to fully start." -ForegroundColor Yellow
Write-Host "`nServices will be available at:" -ForegroundColor Cyan
Write-Host "- Eureka Server: http://localhost:8761" -ForegroundColor White
Write-Host "- API Gateway: http://localhost:8080" -ForegroundColor White  
Write-Host "- Restaurant Service: http://localhost:8083" -ForegroundColor White
Write-Host "- Frontend: http://localhost:8087" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
