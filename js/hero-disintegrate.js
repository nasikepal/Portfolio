(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const titleLines = document.querySelectorAll('.hero-title .title-line');
        if (!titleLines.length) return;

        // Split text into individual letters
        titleLines.forEach(line => {
            const text = line.innerText;
            line.innerHTML = '';
            text.split('').forEach(char => {
                if (char === ' ') {
                    line.appendChild(document.createTextNode(' '));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'disintegrate-letter';
                span.innerText = char;
                span.style.position = 'relative';
                span.style.display = 'inline-block';
                line.appendChild(span);
            });
        });

        const chars = '!<>-_\\/[]{}—=+*^?#_0123456789.';
        const letters = document.querySelectorAll('.disintegrate-letter');
        const heroTitle = document.querySelector('.hero-title');

        const letterData = [];

        // Setup particles for each letter
        letters.forEach(letter => {
            const numParticles = 15 + Math.floor(Math.random() * 10); // 15-25 particles per letter (sweet spot for performance)
            const particles = [];
            
            for (let i = 0; i < numParticles; i++) {
                const p = document.createElement('span');
                p.innerText = chars[Math.floor(Math.random() * chars.length)];
                p.style.position = 'absolute';
                p.style.left = '0';
                p.style.top = '0';
                p.style.width = '100%';
                p.style.height = '100%';
                p.style.display = 'flex';
                p.style.alignItems = 'center';
                p.style.justifyContent = 'center';
                p.style.fontSize = (Math.random() * 0.06 + 0.02) + 'em'; 
                p.style.color = '#ffffff';
                p.style.pointerEvents = 'none';
                p.style.zIndex = 10;
                p.style.opacity = '0';
                p.style.transform = 'translate3d(0,0,0)';
                p.style.willChange = 'transform, opacity'; // hint browser for GPU accel
                
                letter.appendChild(p);
                
                particles.push({
                    el: p,
                    randX: (Math.random() - 0.5) * 600, 
                    randY: (Math.random() - 0.5) * 600,
                    randRot: (Math.random() - 0.5) * 360,
                    currX: 0,
                    currY: 0,
                    currRot: 0,
                    currOp: 0,
                    visible: false // track visibility to avoid DOM reads
                });
            }
            
            letterData.push({
                el: letter,
                rect: null, 
                particles: particles,
                isDisintegrated: false,
                restoreTimeout: null
            });
        });

        let mouseX = -1000;
        let mouseY = -1000;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        // Simple linear interpolation for silky smooth physics
        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function updateMagneticField() {
            const radius = 250; // Larger magnetic bounding box to affect multiple letters

            letterData.forEach(data => {
                let targetForce = 0;
                let dirX = 0;
                let dirY = 0;
                
                // Get rect dynamically every frame to ensure perfect accuracy
                // even after scroll, resize, or font-loading. (15 calls is negligible performance-wise)
                const rect = data.el.getBoundingClientRect();
                const letterX = rect.left + rect.width / 2;
                const letterY = rect.top + rect.height / 2;
                
                const dx = letterX - mouseX;
                const dy = letterY - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    targetForce = (radius - distance) / radius; // 0 to 1 intensity
                    
                    // Push away vector
                    dirX = (dx / (distance || 1)) * 150; 
                    dirY = (dy / (distance || 1)) * 150;
                    
                    if (!data.isDisintegrated) {
                        data.el.style.color = 'transparent';
                        data.isDisintegrated = true;
                        if (data.restoreTimeout) {
                            clearTimeout(data.restoreTimeout);
                            data.restoreTimeout = null;
                        }
                    }
                }
                
                // Return to normal
                if (targetForce === 0 && data.isDisintegrated && !data.restoreTimeout) {
                    data.restoreTimeout = setTimeout(() => {
                        data.el.style.color = '';
                        data.isDisintegrated = false;
                        data.restoreTimeout = null;
                    }, 350); // delay text reveal until particles are mostly faded
                }

                // Smoothly update each particle
                data.particles.forEach(p => {
                    // Skip math and DOM updates entirely if particle is fully resting and invisible
                    if (targetForce === 0 && p.currOp < 0.01 && !p.visible) return;

                    const tX = (dirX + p.randX) * targetForce;
                    const tY = (dirY + p.randY) * targetForce;
                    const tRot = p.randRot * targetForce;
                    const tOp = targetForce > 0 ? (targetForce * 0.8 + 0.2) : 0;
                    
                    const lerpFactor = targetForce > 0 ? 0.18 : 0.05; 
                    
                    p.currX = lerp(p.currX, tX, lerpFactor);
                    p.currY = lerp(p.currY, tY, lerpFactor);
                    p.currRot = lerp(p.currRot, tRot, lerpFactor);
                    p.currOp = lerp(p.currOp, tOp, lerpFactor);
                    
                    if (p.currOp > 0.01) {
                        p.el.style.opacity = p.currOp.toFixed(3);
                        // Using translate3d forces GPU hardware acceleration
                        p.el.style.transform = `translate3d(${p.currX.toFixed(1)}px, ${p.currY.toFixed(1)}px, 0) rotate(${p.currRot.toFixed(1)}deg)`;
                        p.visible = true;
                    } else if (p.visible) {
                        p.currOp = 0;
                        p.currX = 0;
                        p.currY = 0;
                        p.currRot = 0;
                        p.el.style.opacity = '0';
                        p.el.style.transform = `translate3d(0px, 0px, 0) rotate(0deg)`;
                        p.visible = false;
                    }
                });
            });

            requestAnimationFrame(updateMagneticField);
        }

        // Start animation loop
        requestAnimationFrame(updateMagneticField);
    });
})();
