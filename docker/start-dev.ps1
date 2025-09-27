# GrubStack Development Environment Startup Script for Windows
# This script starts all services in development mode

Write-Host "🚀 Starting GrubStack Development Environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️  Please update .env file with your configuration before running again." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ .env.example file not found. Please create it first." -ForegroundColor Red
        exit 1
    }
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
docker-compose ps

# Show recent logs
Write-Host "📋 Recent logs:" -ForegroundColor Yellow
docker-compose logs --tail=20

Write-Host "✅ GrubStack Development Environment is starting up!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:8081" -ForegroundColor Cyan
Write-Host "🔌 API Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📊 Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "🗄️  MySQL: localhost:3307" -ForegroundColor Cyan
Write-Host "📧 Kafka: localhost:9092" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 To view logs: docker-compose logs -f [service-name]" -ForegroundColor White
Write-Host "🛑 To stop: docker-compose down" -ForegroundColor White
