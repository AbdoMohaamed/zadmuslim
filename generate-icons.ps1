Add-Type -AssemblyName System.Drawing

$sourcePath = "D:\Work\zadmuslim\assets\icon-512.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found!"
    exit 1
}

$sourceImg = [System.Drawing.Bitmap]::FromFile($sourcePath)

function Resize-Image($src, $w, $h, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap $w, $h
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($src, 0, 0, $w, $h)
    $graphics.Dispose()
    
    $dir = [System.IO.Path]::GetDirectoryName($destPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Save as PNG
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBitmap.Dispose()
    Write-Host "Generated: $destPath ($w x $h)"
}

# Android Mipmaps
$androidMap = @{
    "mdpi" = @{ size = 48; fg = 108 }
    "hdpi" = @{ size = 72; fg = 162 }
    "xhdpi" = @{ size = 96; fg = 216 }
    "xxhdpi" = @{ size = 144; fg = 324 }
    "xxxhdpi" = @{ size = 192; fg = 432 }
}

foreach ($density in $androidMap.Keys) {
    $info = $androidMap[$density]
    $folder = "D:\Work\zadmuslim\android\app\src\main\res\mipmap-$density"
    
    Resize-Image $sourceImg $info.size $info.size "$folder\ic_launcher.png"
    Resize-Image $sourceImg $info.size $info.size "$folder\ic_launcher_round.png"
    Resize-Image $sourceImg $info.fg $info.fg "$folder\ic_launcher_foreground.png"
}

# Notification Small Icon for Android
Resize-Image $sourceImg 96 96 "D:\Work\zadmuslim\android\app\src\main\res\drawable\ic_stat_icon.png"

# iOS App Icon (1024x1024)
Resize-Image $sourceImg 1024 1024 "D:\Work\zadmuslim\ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png"

$sourceImg.Dispose()
Write-Host "All icons generated successfully!"
