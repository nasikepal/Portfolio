$content = Get-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css" -Raw
$content = $content -replace "'Inter', sans-serif", "'JetBrains Mono', monospace"
Set-Content -Path "C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css" -Value $content
