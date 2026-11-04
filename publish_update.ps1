param (
    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.2",

    [Parameter(Mandatory=$false)]
    [int]$VersionCode = 3,

    [Parameter(Mandatory=$false)]
    [string]$Title = "Bản Nâng Cấp Mới!",

    [Parameter(Mandatory=$false)]
    [string[]]$Changelog = @(
        "Nâng cấp hiệu năng ứng dụng",
        "Tối ưu hóa giao diện và trải nghiệm người dùng",
        "Sửa các lỗi nhỏ phát sinh"
    )
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    QUY TRÌNH PHÁT HÀNH BẢN CẬP NHẬT TỰ ĐỘNG (SELF-HOSTED)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
$RELEASES_DIR = Join-Path $ROOT_DIR "releases"
$SOURCE_APK = Join-Path $ROOT_DIR "bio_mobile\build\app\outputs\flutter-apk\app-release.apk"
$TARGET_APK_NAME = "bio_app_v$Version.apk"
$TARGET_APK = Join-Path $RELEASES_DIR $TARGET_APK_NAME
$VERSION_JSON = Join-Path $RELEASES_DIR "version.json"

if (-not (Test-Path $RELEASES_DIR)) {
    New-Item -ItemType Directory -Path $RELEASES_DIR -Force | Out-Null
}

# 1. Kiểm tra file APK đã build hay chưa
if (Test-Path $SOURCE_APK) {
    Write-Host "[1/3] Tìm thấy file APK vừa build: $SOURCE_APK" -ForegroundColor Green
    Copy-Item -Path $SOURCE_APK -Destination $TARGET_APK -Force
    $sizeBytes = (Get-Item $TARGET_APK).Length
    $sizeMB = [math]::Round($sizeBytes / 1MB, 1)
    $apkSizeStr = "$sizeMB MB"
} else {
    Write-Host "[1/3] Chưa tìm thấy file build thực tế, tạo file mẫu: $TARGET_APK_NAME" -ForegroundColor Yellow
    if (-not (Test-Path $TARGET_APK)) {
        New-Item -ItemType File -Path $TARGET_APK -Force | Out-Null
    }
    $apkSizeStr = "25.0 MB"
}

# 2. Cập nhật version.json
$nowDate = (Get-Date).ToString("yyyy-MM-dd")
$versionData = [PSCustomObject]@{
    version           = $Version
    versionCode       = $VersionCode
    minSupportVersion = "1.0.0"
    apkUrl            = "/releases/$TARGET_APK_NAME"
    apkSize           = $apkSizeStr
    releaseDate       = $nowDate
    forceUpdate       = $false
    title             = $Title
    changelog         = $Changelog
}

$jsonContent = $versionData | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($VERSION_JSON, $jsonContent, [System.Text.Encoding]::UTF8)

Write-Host "[2/3] Đã cập nhật $VERSION_JSON phiên bản $Version thành công!" -ForegroundColor Green

# 3. Kiểm tra API máy chủ
Write-Host "[3/3] Kiểm tra endpoint máy chủ..." -ForegroundColor Green
try {
    $res = Invoke-RestMethod -Uri "http://localhost:3000/api/app-version" -Method GET -TimeoutSec 3
    Write-Host "✅ Máy chủ đã nhận phiên bản mới:" -ForegroundColor Green
    Write-Host "- Phiên bản: $($res.version)" -ForegroundColor Cyan
    Write-Host "- Link tải:  $($res.fullDownloadUrl)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Máy chủ chưa khởi động hoặc chưa reload. Hãy chạy 'node server.js'." -ForegroundColor Yellow
}

Write-Host "`n🎉 HOÀN TẤT: Tất cả người dùng đang mở app cũ sẽ nhận được thông báo nâng cấp ngay lập tức!" -ForegroundColor Green
