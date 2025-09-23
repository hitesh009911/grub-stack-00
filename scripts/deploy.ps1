# GrubStack Deployment Script
param(
    [string]$Environment = "development"
)

Write-Host "🚀 Starting GrubStack deployment..." -ForegroundColor Blue
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Blue

if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Deploy based on environment
Write-Host "🏗️ Deploying to $Environment environment..." -ForegroundColor Blue

if ($Environment -eq "development") {
    docker-compose -f docker-compose.yml up -d
} elseif ($Environment -eq "staging") {
    docker-compose -f docker-compose.staging.yml up -d
} elseif ($Environment -eq "production") {
    docker-compose -f docker-compose.prod.yml up -d
} else {
    Write-Host "❌ Unknown environment: $Environment" -ForegroundColor Red
    Write-Host "Usage: .\deploy.ps1 development" -ForegroundColor Yellow
    exit 1
}

# Wait for services
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Blue
Start-Sleep -Seconds 30

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "📊 Service URLs:" -ForegroundColor Blue
Write-Host "  Frontend: http://localhost:8081" -ForegroundColor Yellow
Write-Host "  API Gateway: http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Eureka Dashboard: http://localhost:8761" -ForegroundColor Yellow