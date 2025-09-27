# GrubStack Stop Script for Windows
# This script stops all running containers

Write-Host "🛑 Stopping GrubStack services..." -ForegroundColor Yellow

# Stop development environment
if (Test-Path "docker-compose.yml") {
    Write-Host "Stopping development environment..." -ForegroundColor Yellow
    docker-compose down
}

# Stop production environment
if (Test-Path "docker-compose.prod.yml") {
    Write-Host "Stopping production environment..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml down
}

# Stop staging environment
if (Test-Path "docker-compose.staging.yml") {
    Write-Host "Stopping staging environment..." -ForegroundColor Yellow
    docker-compose -f docker-compose.staging.yml down
}

# Clean up unused containers and images
Write-Host "🧹 Cleaning up unused containers and images..." -ForegroundColor Yellow
docker system prune -f

Write-Host "✅ All GrubStack services stopped and cleaned up!" -ForegroundColor Green
