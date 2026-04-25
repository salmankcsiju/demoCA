# Casa Amora - Atelier Deployment & Sync Script
# This script builds the React frontend and prepares the Django backend for production serving.

Write-Host "--- Initiating Casa Amora Atelier Sync ---" -ForegroundColor Gold

# 1. Frontend Build
Write-Host "Step 1: Building React Production Artifacts..." -ForegroundColor Cyan
Set-Location -Path "."

# 0. Nuclear Cleanup (Purge All Caches)
Write-Host "Step 0: Nuclear Purge of Ghost Assets..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "../backend/staticfiles") {
    Remove-Item -Recurse -Force "../backend/staticfiles"
}

# 1. Frontend Build
Write-Host "Step 1: Building React Production Artifacts..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed. Check your CSS/TypeScript errors." -ForegroundColor Red
    Exit $LASTEXITCODE
}

# 2. Path Verification
Write-Host "Step 2: Verifying Distribution Integrity..." -ForegroundColor Cyan
if (Test-Path "dist/index.html") {
    Write-Host "Success: index.html located in dist/." -ForegroundColor Green
} else {
    Write-Host "Error: index.html missing from dist/. Build may have incomplete output." -ForegroundColor Red
    Exit 1
}

# 3. Django Static Collection
Write-Host "Step 3: Collecting Static Assets for Django..." -ForegroundColor Cyan
Set-Location -Path "../backend"
python manage.py collectstatic --noinput

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Django collectstatic failed. Check your STATICFILES_DIRS settings." -ForegroundColor Red
    Exit $LASTEXITCODE
}

Write-Host "--- Sync Complete! ---" -ForegroundColor Gold
Write-Host "The Staff Atelier is now ready at http://127.0.0.1:8000/staff-atelier/" -ForegroundColor Green
Write-Host "Note: Ensure your Django server is running (python manage.py runserver)." -ForegroundColor Gray
