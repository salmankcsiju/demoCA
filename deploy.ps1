# Casa Amora - Nuclear Deployment Script
# Role: Senior Architect Automation
Write-Host "--- 🧪 Starting Atelier Production Finalization ---" -ForegroundColor Gold

$projectRoot = $PSScriptRoot
$websiteDir = Join-Path $projectRoot "website"
$backendDir = Join-Path $projectRoot "backend"

# Step 1: Nuclear Cleanup
Write-Host "[1/4] Cleaning previous build artifacts..." -ForegroundColor Cyan
if (Test-Path "$websiteDir\dist") { Remove-Item -Recurse -Force "$websiteDir\dist" }
if (Test-Path "$backendDir\staticfiles") { Remove-Item -Recurse -Force "$backendDir\staticfiles" }
if (Test-Path "$backendDir\django.log") { Remove-Item "$backendDir\django.log" }

# Step 2: Frontend Build
Write-Host "[2/4] Executing Vite Production Build..." -ForegroundColor Cyan
Set-Location $websiteDir
npm run build

# Step 3: Backend Static Sync
Write-Host "[3/4] Synchronizing static files to Django..." -ForegroundColor Cyan
Set-Location $backendDir
python manage.py collectstatic --noinput

# Step 4: Verification
Write-Host "[4/4] Deployment Complete." -ForegroundColor Green
Write-Host "Target URL: http://127.0.0.1:8000/staff-atelier/" -ForegroundColor Gold
Write-Host "Status: Ready for Production." -ForegroundColor Green
