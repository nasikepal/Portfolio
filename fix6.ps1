$content = [System.IO.File]::ReadAllText("css\style.css")

$pattern = '(?s)\.marquee-section \{\s*padding: 60px 0;\s*overflow: hidden;\s*border-top: 1px solid rgba\(255, 255, 255, 0\.06\);\s*border-bottom: 1px solid rgba\(255, 255, 255, 0\.06\);\s*background: #050508;\s*\}'

$newText = @"
.marquee-section {
    position: relative;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: #000000;
}

.marquee-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.marquee-overlay {
    position: relative;
    z-index: 1;
    background: #050508;
    color: #ffffff;
    mix-blend-mode: multiply;
    width: 100%;
    height: 100%;
    padding: 60px 0;
}
"@

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $newText
    [System.IO.File]::WriteAllText("css\style.css", $newContent)
    Write-Host "Replaced successfully."
} else {
    Write-Host "Pattern not found."
}
