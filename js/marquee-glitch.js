(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const tracks = document.querySelectorAll('.marquee-content');
        if (tracks.length === 0) return;

        const chars = '!<>-_\\/[]{}—=+*^?#_0123456789';
        const numWords = tracks[0].querySelectorAll('span:not(.marquee-dot)').length;
        
        // Store original text
        tracks.forEach(track => {
            track.querySelectorAll('span:not(.marquee-dot)').forEach(span => {
                span.dataset.original = span.innerText;
                // Force fixed width so the text doesn't jiggle when scrambling
                const rect = span.getBoundingClientRect();
                span.style.display = 'inline-block';
                span.style.minWidth = rect.width + 'px';
            });
        });

        function scrambleSpans(spans) {
            const original = spans[0].dataset.original;
            let iterations = 0;
            const maxIterations = 15;
            
            const interval = setInterval(() => {
                const scrambled = original.split('').map((char, index) => {
                    if (char === ' ') return ' ';
                    if (index < (iterations / maxIterations) * original.length) {
                        // 30% chance to still be scrambled even if it 'should' be revealed, for a cool glitch effect
                        if (Math.random() > 0.8) {
                            return chars[Math.floor(Math.random() * chars.length)];
                        }
                        return original[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');

                spans.forEach(span => {
                    span.innerText = scrambled;
                });
                
                iterations++;
                if (iterations >= maxIterations) {
                    clearInterval(interval);
                    spans.forEach(span => span.innerText = original);
                }
            }, 40);
        }

        setInterval(() => {
            const wordIndex = Math.floor(Math.random() * numWords);
            const spansToScramble = [];
            tracks.forEach(track => {
                const spans = track.querySelectorAll('span:not(.marquee-dot)');
                if (spans[wordIndex]) {
                    spansToScramble.push(spans[wordIndex]);
                }
            });
            
            if (spansToScramble.length > 0) {
                scrambleSpans(spansToScramble);
            }
        }, 1500);
    });
})();
