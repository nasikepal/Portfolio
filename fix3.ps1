$content = [System.IO.File]::ReadAllText("css\style.css")

$pattern = '(?s)\.work-title \{\s*font-family: ''JetBrains Mono'', monospace;\s*font-size: 1\.3rem;\s*grid-template-columns: 1fr 1fr;\s*gap: 80px;\s*margin-bottom: 80px;\s*align-items: start;\s*\}'

$newText = @"
.work-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.3rem;
    font-weight: 600;
    color: #f0efe9;
    margin-bottom: 4px;
}

.work-category {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: #ffffff;
    letter-spacing: 3px;
    text-transform: uppercase;
}

/* ──────────────────────────────────────────────────
   10. MARQUEE
   ────────────────────────────────────────────────── */
.marquee-section {
    padding: 60px 0;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: #050508;
}

.marquee-track {
    display: flex;
    width: max-content;
    animation: marqueeScroll 20s linear infinite;
}

.marquee-track:hover {
    animation-play-state: paused;
}

.marquee-content {
    display: flex;
    align-items: center;
    width: max-content;
    flex-shrink: 0;
    gap: 32px;
    padding-right: 32px;
}

.marquee-content span {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 700;
    color: #f0efe9;
    white-space: nowrap;
    text-transform: uppercase;
}

.marquee-dot {
    color: #ffffff !important;
    font-size: 1.5rem !important;
}

@keyframes marqueeScroll {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}


/* ──────────────────────────────────────────────────
   11. CONTACT SECTION
   ────────────────────────────────────────────────── */
.contact-section {
    padding: 120px 0;
    background: #050508;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    margin-bottom: 80px;
    align-items: start;
}
"@

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $newText
    [System.IO.File]::WriteAllText("css\style.css", $newContent)
    Write-Host "Replaced successfully."
} else {
    Write-Host "Pattern not found."
}
