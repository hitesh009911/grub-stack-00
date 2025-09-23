# GrubStack Stop Script (PowerShell)
# This script stops all GrubStack services

param(
    [switch]$RemoveImages = $false,
    [switch]$RemoveVolumes = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🛑 Stopping GrubStack services..." -ForegroundColor $Blue

# Stop all services
Write-Host "Stopping Docker containers..." -ForegroundColor $Yellow
docker-compose down

# Remove unused images (optional)
if ($RemoveImages) {
    Write-Host "Removing unused images..." -ForegroundColor $Yellow
    docker image prune -f
}

# Remove unused volumes (optional)
if ($RemoveVolumes) {
    Write-Host "Removing unused volumes..." -ForegroundColor $Yellow
    docker volume prune -f
}

Write-Host "✅ All services stopped successfully" -ForegroundColor $Green

