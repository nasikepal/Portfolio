$content = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css" -Raw
$content = $content -replace "'JetBrains Mono', monospace", "'Inter', sans-serif"
$content = $content -replace "'Space Grotesk', sans-serif", "'Inter', sans-serif"
Set-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css" -Value $content
