Add-Type -AssemblyName System.Drawing

$sourcePath = "D:\Work\zadmuslim\assets\icon-512.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at $sourcePath"
    exit 1
}

$bytes = [System.IO.File]::ReadAllBytes($sourcePath)
$ms = New-Object System.IO.MemoryStream(,$bytes)
$sourceImg = [System.Drawing.Bitmap]::FromStream($ms)
$brandBgColor = [System.Drawing.ColorTranslator]::FromHtml("#0D1728")

function Save-Bitmap($destBitmap, $destPath) {
    $dir = [System.IO.Path]::GetDirectoryName($destPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBitmap.Dispose()
    Write-Host "Generated: $destPath"
}

function Create-StandardIcon($src, $w, $h, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap $w, $h
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear($brandBgColor)
    $graphics.DrawImage($src, 0, 0, $w, $h)
    $graphics.Dispose()
    Save-Bitmap $destBitmap $destPath
}

function Create-RoundIcon($src, $w, $h, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap $w, $h
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $w, $h)
    $graphics.SetClip($path)
    $graphics.Clear($brandBgColor)
    
    # Scale slightly so outer borders don't touch circle tangent
    $innerSize = [int]($w * 0.88)
    $offset = [int](($w - $innerSize) / 2)
    $graphics.DrawImage($src, $offset, $offset, $innerSize, $innerSize)
    $graphics.Dispose()
    Save-Bitmap $destBitmap $destPath
}

function Create-AdaptiveForeground($src, $w, $h, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap $w, $h
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Scale to ~72% so all content fits perfectly inside Android safe zone circle (72dp of 108dp)
    $fgSize = [int]($w * 0.72)
    $offset = [int](($w - $fgSize) / 2)
    $graphics.DrawImage($src, $offset, $offset, $fgSize, $fgSize)
    $graphics.Dispose()
    Save-Bitmap $destBitmap $destPath
}

# -------------------------------------------------------------
# 1. Android Mipmaps
# -------------------------------------------------------------
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
    
    Create-StandardIcon $sourceImg $info.size $info.size "$folder\ic_launcher.png"
    Create-RoundIcon $sourceImg $info.size $info.size "$folder\ic_launcher_round.png"
    Create-AdaptiveForeground $sourceImg $info.fg $info.fg "$folder\ic_launcher_foreground.png"
}

# -------------------------------------------------------------
# 2. Android Notification Small Icon
# -------------------------------------------------------------
Create-StandardIcon $sourceImg 96 96 "D:\Work\zadmuslim\android\app\src\main\res\drawable\ic_stat_icon.png"

# -------------------------------------------------------------
# 3. iOS App Icon (1024x1024, No Transparency)
# -------------------------------------------------------------
Create-StandardIcon $sourceImg 1024 1024 "D:\Work\zadmuslim\ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png"

# -------------------------------------------------------------
# 4. Web & Store Assets
# -------------------------------------------------------------
Create-StandardIcon $sourceImg 192 192 "D:\Work\zadmuslim\assets\icon-192.png"
Create-StandardIcon $sourceImg 512 512 "D:\Work\zadmuslim\assets\icon-512.png"
Create-StandardIcon $sourceImg 512 512 "D:\Work\zadmuslim\store-assets\icon-512x512.png"

$sourceImg.Dispose()
Write-Host "All icons generated and synchronized successfully!"
