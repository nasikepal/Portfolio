$files = Get-ChildItem -Path ".\*-index.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $newContent = @()
    
    foreach ($line in $content) {
        if ($line -match "</head>") {
            $newContent += "    <script src=`"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`"></script>"
            $newContent += "    <script src=`"js/transition.js`"></script>"
            $newContent += $line
        } else {
            $newContent += $line
        }
    }
    
    Set-Content -Path $file.FullName -Value $newContent
}
