$content = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css" -Raw
$newCss = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\new_css.txt" -Raw

$safeNewCss = $newCss.Replace('$', '$$')

# The old cassette CSS spans from:
# /* Cassette Tape Rack (5-Cassette Fan-Deck) */
# Down to just before:
# /* Works Grid */
$content = $content -replace '(?s)/\* Cassette Tape Rack \(5-Cassette Fan-Deck\) \*/.*?/\* Works Grid \*/', "$safeNewCss`n`n/* Works Grid */"
Set-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css" -Value $content
