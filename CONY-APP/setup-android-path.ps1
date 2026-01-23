# Android SDK platform-tools를 PATH에 추가하는 스크립트
# 이 스크립트를 실행하면 현재 PowerShell 세션에만 적용됩니다.

$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"

if (Test-Path $androidSdkPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    if ($currentPath -notlike "*$androidSdkPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$androidSdkPath", "User")
        Write-Host "Android SDK platform-tools가 PATH에 추가되었습니다." -ForegroundColor Green
        Write-Host "새로운 터미널을 열어야 변경사항이 적용됩니다." -ForegroundColor Yellow
    } else {
        Write-Host "Android SDK platform-tools가 이미 PATH에 있습니다." -ForegroundColor Green
    }
    
    # 현재 세션에도 추가
    $env:Path += ";$androidSdkPath"
    Write-Host "현재 세션에 PATH가 추가되었습니다." -ForegroundColor Green
} else {
    Write-Host "Android SDK를 찾을 수 없습니다: $androidSdkPath" -ForegroundColor Red
}
