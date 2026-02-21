# Kill process on port 3000 and start backend
Write-Host "🛑 Killing any process on port 3000..." -ForegroundColor Yellow

$port3000Process = netstat -ano | findstr ":3000" | ForEach-Object {
    $_ -match '\s+(\d+)\s*$' | Out-Null
    $matches[1]
} | Select-Object -Unique

if ($port3000Process) {
    foreach ($pid in $port3000Process) {
        Write-Host "   Killing PID: $pid" -ForegroundColor Gray
        taskkill /PID $pid /F 2>$null
    }
    Write-Host "✅ Port 3000 cleared" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 is already free" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""
cd backend
npm run start:dev
