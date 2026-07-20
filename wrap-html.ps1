$files = Get-ChildItem -Path ".\*-index.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $newContent = @()
    $insideBody = $false
    
    foreach ($line in $content) {
        if ($line -match "<body class=`"index-page`">") {
            $newContent += $line
            $newContent += "    <main id=`"swup`" class=`"transition-fade`">"
            $insideBody = $true
        } elseif ($line -match "</body>") {
            $newContent += "    </main>"
            $newContent += $line
            $insideBody = $false
        } else {
            $newContent += $line
        }
    }
    
    Set-Content -Path $file.FullName -Value $newContent
}
