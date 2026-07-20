$content = [System.IO.File]::ReadAllText("css\style.css")

$pattern = '(?s)\/\* ──────────────────────────────────────────────────\s*9\. WORKS SECTION\s*────────────────────────────────────────────────── \*\/'

$newText = @"
/* ──────────────────────────────────────────────────
   SECTION LABELS (Global)
   ────────────────────────────────────────────────── */
.section-label {
    width: 100%;
    text-align: left;
    padding: 30px 40px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.1rem;
    color: #e0e0e0;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* ──────────────────────────────────────────────────
   9. WORKS SECTION
   ────────────────────────────────────────────────── */
"@

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $newText
    [System.IO.File]::WriteAllText("css\style.css", $newContent)
    Write-Host "Replaced successfully."
} else {
    Write-Host "Pattern not found."
}
