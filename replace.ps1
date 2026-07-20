$content = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\index.html" -Raw
$newHtml = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\new_html.txt" -Raw

# Replace any $ in newHtml with $$ so it's not treated as a regex backreference by powershell
$safeNewHtml = $newHtml.Replace('$', '$$')

$content = $content -replace '(?s)<!-- Cassette Tape Rack \(5-Cassette Fan-Deck\) -->.*?</section>', $safeNewHtml
Set-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\index.html" -Value $content
