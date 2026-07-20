$c = Get-Content 'C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css' -Raw
$c = $c -replace "\.showreel-title-overlay \{", ".play-symbol {
    color: #050508;
    font-size: 1.5rem;
    margin-left: 6px;
}

.showreel-watermark {
    position: absolute;
    top: 24px;
    left: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 1px;
    pointer-events: none;
}

.showreel-title-overlay {"
Set-Content 'C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\css\style.css' $c
