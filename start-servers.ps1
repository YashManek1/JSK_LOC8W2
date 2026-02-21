# LOC_PREP Quick Start Script
# Run each command in a separate PowerShell terminal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LOC_PREP - Quick Start Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill process on port 3000
Write-Host "[1/3] Cleaning up port 3000..." -ForegroundColor Yellow
try {
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -Unique | 
        ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "✅ Port 3000 is now available" -ForegroundColor Green
} catch {
    Write-Host "✅ Port 3000 was already free" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Opening new terminal for backend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Tanay IMP\Hackathons\LOC_PREP\backend'; Write-Host '🚀 Starting NestJS Backend...' -ForegroundColor Cyan; npm run start:dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[3/3] Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Opening new terminal for frontend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Tanay IMP\Hackathons\LOC_PREP\frontend'; Write-Host '⚡ Starting Vite Frontend...' -ForegroundColor Magenta; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to check server status..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Check if servers are running
Write-Host ""
Write-Host "Checking server status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding. Check the backend terminal for errors." -ForegroundColor Red
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 2
    Write-Host "✅ Frontend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend not responding. Check the frontend terminal for errors." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Test Commands:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "curl http://localhost:3000/" -ForegroundColor Gray
Write-Host "curl http://localhost:3000/github/stats/Team%20Innovix" -ForegroundColor Gray
Write-Host "curl http://localhost:3000/test/mock-github-data/TestTeam" -ForegroundColor Gray
Write-Host ""
Write-Host "Navigate to: http://localhost:5173/cockpit" -ForegroundColor Magenta
Write-Host ""
