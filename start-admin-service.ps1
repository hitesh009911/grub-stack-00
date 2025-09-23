# Start Admin Service
Write-Host "Starting Admin Service..." -ForegroundColor Green

# Set JAVA_HOME if not already set
if (-not $env:JAVA_HOME) {
    Write-Host "JAVA_HOME not set. Please set JAVA_HOME to your JDK installation directory." -ForegroundColor Red
    Write-Host "Example: `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'" -ForegroundColor Yellow
    exit 1
}

# Navigate to admin service directory
Set-Location admin-service

# Clean and compile
Write-Host "Compiling admin service..." -ForegroundColor Yellow
mvn clean compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}

# Start the service
Write-Host "Starting admin service on port 8087..." -ForegroundColor Green
mvn spring-boot:run

# Return to root directory
Set-Location ..

