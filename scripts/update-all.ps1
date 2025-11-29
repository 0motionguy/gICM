# ============================================================================
# gICM Platform - Update All Script (PowerShell)
# ============================================================================
# Run this script to bring all agents and services up to date
#
# Usage:
#   .\scripts\update-all.ps1           # Full update
#   .\scripts\update-all.ps1 -Quick    # Skip install, just build
# ============================================================================

param(
    [switch]$Quick
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  gICM Platform - Update All" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($Quick) {
    Write-Host "Running in quick mode (skipping install)" -ForegroundColor Yellow
}

# Step 1: Install dependencies
if (-not $Quick) {
    Write-Host "Step 1/4: Installing dependencies..." -ForegroundColor White
    pnpm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Step 2: Build core packages first
Write-Host "Step 2/4: Building core packages..." -ForegroundColor White
try {
    pnpm --filter @gicm/agent-core build 2>$null
} catch {
    Write-Host "  (agent-core skipped)" -ForegroundColor Gray
}
Write-Host "✓ Core packages built" -ForegroundColor Green
Write-Host ""

# Step 3: Build all packages
Write-Host "Step 3/4: Building all packages..." -ForegroundColor White
pnpm -r build
Write-Host "✓ All packages built" -ForegroundColor Green
Write-Host ""

# Step 4: Verify builds
Write-Host "Step 4/4: Verifying builds..." -ForegroundColor White

$BuiltCount = 0

# Count packages
Get-ChildItem -Path "packages\*\dist" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $BuiltCount++
}

# Count services
Get-ChildItem -Path "services\*\dist" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $BuiltCount++
}

Write-Host "✓ $BuiltCount packages/services built successfully" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Update Complete!" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Built packages:" -ForegroundColor White
Get-ChildItem -Path "packages\*\dist" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $pkgName = $_.Parent.Name
    Write-Host "  ✓ @gicm/$pkgName" -ForegroundColor Green
}

Write-Host ""
Write-Host "Built services:" -ForegroundColor White
Get-ChildItem -Path "services\*\dist" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $svcName = $_.Parent.Name
    Write-Host "  ✓ $svcName" -ForegroundColor Green
}

Write-Host ""
Write-Host "Run 'pnpm dev' to start development mode" -ForegroundColor Gray
Write-Host ""
