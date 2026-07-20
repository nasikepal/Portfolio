$lines = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\index.html"
$newLines = @()
$inPreloader = $false

foreach ($line in $lines) {
    if ($line -match "id=`"preloader`"") {
        $inPreloader = $true
        # Remove the previous line which contains the PRELOADER comment
        if ($newLines.Length -gt 0) {
            $newLines = $newLines[0..($newLines.Length-2)]
        }
    }
    
    if (-not $inPreloader) {
        $newLines += $line
    }
    
    if ($inPreloader -and $line -match "<!-- ═══════════════════ NAVIGATION ═══════════════════ -->") {
        $inPreloader = $false
        $newLines += $line
    }
}

Set-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\index.html" -Value $newLines
