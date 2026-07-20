$path = 'C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css'
$content = Get-Content $path -Raw
$replacement = @"
#navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    padding: 20px 40px;
    transition: background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    border-bottom: 1px solid transparent;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
}

#navbar.scrolled {
    background: rgba(10, 10, 14, 0.9);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
}
"@
$content = $content -replace '(?s)#navbar\s*\{.*?#navbar\.scrolled\s*\{[^\}]*\}', $replacement
Set-Content $path -Value $content -Encoding UTF8
