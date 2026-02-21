# LOC_PREP Status Check
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LOC_PREP System Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "[1/3] Checking Backend (Port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get -TimeoutSec 2
    Write-Host "✅ Backend is running: $response" -ForegroundColor Green
    
    # Test GitHub endpoints
    Write-Host "   Testing /test/mock-github-data..." -ForegroundColor Gray
    $testResponse = Invoke-RestMethod -Uri "http://localhost:3000/test/mock-github-data/TestTeam" -Method Get -TimeoutSec 2
    Write-Host "   ✅ Mock GitHub endpoint working" -ForegroundColor Green
    
    Write-Host "   Testing /test/mock-ai-features..." -ForegroundColor Gray
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:3000/test/mock-ai-features/TestTeam" -Method Get -TimeoutSec 2
    Write-Host "   ✅ Mock AI endpoint working" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Backend not responding" -ForegroundColor Red
    Write-Host "   Run: .\start-backend.ps1" -ForegroundColor Yellow
}

Write-Host ""

# Check Frontend
Write-Host "[2/3] Checking Frontend (Port 5173)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend not responding" -ForegroundColor Red
    Write-Host "   Run: .\start-frontend.ps1" -ForegroundColor Yellow
}

Write-Host ""

# Check Ports
Write-Host "[3/3] Checking Port Status..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000.*LISTENING"
$port5173 = netstat -ano | findstr ":5173.*LISTENING"

if ($port3000) {
    Write-Host "✅ Port 3000: LISTENING" -ForegroundColor Green
} else {
    Write-Host "❌ Port 3000: NOT LISTENING" -ForegroundColor Red
}

if ($port5173) {
    Write-Host "✅ Port 5173: LISTENING" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 5173: NOT LISTENING (Frontend not started)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Links:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend API:    http://localhost:3000" -ForegroundColor Gray
Write-Host "Frontend App:   http://localhost:5173" -ForegroundColor Gray
Write-Host "Hacker Cockpit: http://localhost:5173/cockpit" -ForegroundColor Gray
Write-Host "Admin Portal:   http://localhost:5173/admin" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Test Commands:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "# Test Mock Data" -ForegroundColor Gray
Write-Host "Invoke-RestMethod http://localhost:3000/test/mock-github-data/TestTeam" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Test Real GitHub Sync (requires GitHub token)" -ForegroundColor Gray
Write-Host '$body = @{ githubUrl = "https://github.com/facebook/react" } | ConvertTo-Json' -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/github/sync/ReactTeam" -Method Post -Body $body -ContentType "application/json"' -ForegroundColor Yellow
Write-Host ""
