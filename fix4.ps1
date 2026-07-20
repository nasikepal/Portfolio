$content = [System.IO.File]::ReadAllText("css\style.css")

$pattern = '(?s)\.works-section \{\s*background: #0d0d12;\s*border: 1px dashed rgba\(255, 255, 255, 0\.1\);\s*position: relative;\s*border-radius: 8px;'

$newText = @"
.works-section {
    padding: 120px 0;
    background: #050508;
}

/* Showreel Player styling */
.showreel-container {
    width: 95vw;
    margin-left: calc(50% - 47.5vw);
    margin-bottom: 80px;
}

.showreel-video-placeholder {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #0d0d12;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    position: relative;
    border-radius: 8px;
"@

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $newText
    [System.IO.File]::WriteAllText("css\style.css", $newContent)
    Write-Host "Replaced successfully."
} else {
    Write-Host "Pattern not found."
}
