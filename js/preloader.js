(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        const path = document.getElementById('preloader-path');
        const dot = document.getElementById('preloader-dot');
        const panels = document.querySelectorAll('.preloader-panel');
        
        if (!path || !dot || !panels.length) return;

        // Ensure page is painted before calculating lengths
        setTimeout(() => {
            const pathLength = path.getTotalLength();
            
            // Set initial state for trimming
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = pathLength;
            dot.style.opacity = 0; // Hide dot initially
            
            const tl = gsap.timeline({
                onComplete: () => {
                    // Hide preloader from DOM to allow interaction
                    preloader.style.display = 'none';
                    // Optional: trigger custom event if other scripts want to know
                    window.dispatchEvent(new Event('preloaderComplete'));
                }
            });

            // 1. Show dot and start tracing the path
            tl.to(dot, { opacity: 1, duration: 0.2 })
              .to(path, {
                strokeDashoffset: 0,
                duration: 2.2, // Time to draw the line across screen
                ease: "power2.inOut",
                onUpdate: function() {
                    // Animate the dot perfectly along the bezier curve
                    // this.progress() goes from 0 to 1
                    const currentDrawnLength = pathLength * this.progress(); 
                    const point = path.getPointAtLength(currentDrawnLength);
                    
                    dot.setAttribute('cx', point.x);
                    dot.setAttribute('cy', point.y);
                }
            })
            // 2. Expand vertically (offset) to reveal the content behind it
            .to(panels, {
                yPercent: index => index === 0 ? -100 : 100, // Top goes up (-100%), Bottom goes down (100%)
                duration: 1.2,
                ease: "expo.inOut"
            }, "+=0.2") // Wait 0.2s after graph finishes drawing
            // 3. Fade out the SVG graph itself while panels are splitting
            .to(".preloader-content", {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "<"); // Start at the same time as panel split
            
        }, 100);
    });
})();
