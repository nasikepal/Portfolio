/**
 * ═══════════════════════════════════════════════════════
 *  ASCII TRACERY — Interactive Hover System
 *  Proximity-based character highlighting, morphing,
 *  click ripple, and floating element interactions.
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Bail on touch devices ──
  if ('ontouchstart' in window) return;

  // ── Constants ──
  const ACCENT_COLOR = '#ffffff';
  const DEFAULT_COLOR = '#2a2a3a';
  const CHAR_RADIUS = 80;
  const FLOAT_RADIUS = 100;
  const MORPH_CHANCE = 0.10;
  const RIPPLE_DURATION = 500;
  const RIPPLE_MAX_RADIUS = 200;

  // ── Character morph maps ──
  const MORPH_MAP = {
    '─': ['═', '━', '─'],
    '═': ['━', '─', '═'],
    '━': ['─', '═', '━'],
    '│': ['║', '┃', '│'],
    '║': ['┃', '│', '║'],
    '┃': ['│', '║', '┃'],
    '┌': ['╔', '┏', '┌'],
    '┐': ['╗', '┓', '┐'],
    '└': ['╚', '┗', '└'],
    '┘': ['╝', '┛', '┘'],
    '╔': ['┏', '┌', '╔'],
    '╗': ['┓', '┐', '╗'],
    '╚': ['┗', '└', '╚'],
    '╝': ['┛', '┘', '╝'],
  };

  // ── State ──
  let mouseX = -9999;
  let mouseY = -9999;
  let frameCount = 0;
  let charSpans = [];
  let floatingEls = [];
  let parentRectCache = new Map();
  let activeRipples = [];

  /**
   * Wrap each character inside .ascii-tracery-line elements
   * with a <span class="ascii-char"> for individual styling.
   */
  function wrapCharacters() {
    const lines = document.querySelectorAll('.ascii-tracery-line:not(.wrapped-tracery)');
    lines.forEach((line) => {
      line.classList.add('wrapped-tracery');
      const text = line.textContent;
      line.textContent = '';
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.className = 'ascii-char';
        span.textContent = text[i];
        span.dataset.original = text[i];
        line.appendChild(span);
      }
    });
  }

  /**
   * Collect all character spans and floating elements.
   */
  function collectElements() {
    charSpans = Array.from(document.querySelectorAll('.ascii-char'));
    floatingEls = Array.from(document.querySelectorAll('.floating-ascii'));
  }

  /**
   * Cache parent element bounding rects (once per frame, not per character).
   */
  function cacheParentRects() {
    parentRectCache.clear();
    const parents = new Set();
    charSpans.forEach((span) => {
      if (span.parentElement) parents.add(span.parentElement);
    });
    parents.forEach((parent) => {
      parentRectCache.set(parent, parent.getBoundingClientRect());
    });
  }

  /**
   * Get approximate position of a character span using its parent's
   * cached rect and the span's own offsetLeft/offsetTop within the parent.
   */
  function getCharPosition(span) {
    const parent = span.parentElement;
    const parentRect = parentRectCache.get(parent);
    if (!parentRect) return { x: -9999, y: -9999 };
    return {
      x: parentRect.left + span.offsetLeft + span.offsetWidth * 0.5,
      y: parentRect.top + span.offsetTop + span.offsetHeight * 0.5,
    };
  }

  /**
   * Process proximity hover for ASCII characters.
   */
  function processCharProximity() {
    for (let i = 0; i < charSpans.length; i++) {
      const span = charSpans[i];
      const pos = getCharPosition(span);
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside any active ripple
      let inRipple = false;
      for (let r = 0; r < activeRipples.length; r++) {
        const ripple = activeRipples[r];
        const rdx = ripple.x - pos.x;
        const rdy = ripple.y - pos.y;
        const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
        // Ripple ring is a thin band around the expanding radius
        if (Math.abs(rDist - ripple.currentRadius) < 30) {
          inRipple = true;
          break;
        }
      }

      if (dist < CHAR_RADIUS) {
        // ── Inside proximity radius ──
        const intensity = 1 - dist / CHAR_RADIUS;
        const scale = 1 + 0.1 * intensity;
        span.style.color = ACCENT_COLOR;
        span.style.textShadow = `0 0 ${10 * intensity}px rgba(255,255,255,${0.5 * intensity})`;
        span.style.transform = `scale(${scale})`;
        span.style.display = 'inline-block';

        // ── Character morphing ──
        if (Math.random() < MORPH_CHANCE) {
          const original = span.dataset.original;
          const variants = MORPH_MAP[original];
          if (variants) {
            const idx = Math.floor(Math.random() * variants.length);
            span.textContent = variants[idx];
          }
        }
      } else if (inRipple) {
        // ── Inside ripple wave ──
        span.style.color = ACCENT_COLOR;
        span.style.textShadow = '0 0 8px rgba(255,255,255,0.4)';
        span.style.transform = 'scale(1.05)';
        span.style.display = 'inline-block';
      } else {
        // ── Outside — revert ──
        span.style.color = '';
        span.style.textShadow = '';
        span.style.transform = '';
        span.style.display = '';
        // Revert morphed character
        if (span.textContent !== span.dataset.original) {
          span.textContent = span.dataset.original;
        }
      }
    }
  }

  /**
   * Process proximity hover for floating ASCII elements.
   */
  function processFloatingProximity() {
    for (let i = 0; i < floatingEls.length; i++) {
      const el = floatingEls[i];
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FLOAT_RADIUS) {
        const intensity = 1 - dist / FLOAT_RADIUS;
        const scale = 1 + 0.3 * intensity;
        // Push away from cursor
        const pushStrength = 15 * intensity;
        const angle = Math.atan2(dy, dx);
        const pushX = -Math.cos(angle) * pushStrength;
        const pushY = -Math.sin(angle) * pushStrength;

        el.style.color = ACCENT_COLOR;
        el.style.textShadow = `0 0 ${12 * intensity}px rgba(255,255,255,${0.6 * intensity})`;
        el.style.transform = `translate(${pushX}px, ${pushY}px) scale(${scale})`;
        el.style.transition = 'transform 0.1s ease-out, color 0.15s, text-shadow 0.15s';
      } else {
        el.style.color = '';
        el.style.textShadow = '';
        el.style.transform = '';
        el.style.transition = 'transform 0.4s ease-out, color 0.4s, text-shadow 0.4s';
      }
    }
  }

  /**
   * Update active ripple waves.
   */
  function updateRipples(timestamp) {
    for (let i = activeRipples.length - 1; i >= 0; i--) {
      const ripple = activeRipples[i];
      const elapsed = timestamp - ripple.startTime;
      const progress = Math.min(elapsed / RIPPLE_DURATION, 1);

      ripple.currentRadius = RIPPLE_MAX_RADIUS * easeOutCubic(progress);

      if (progress >= 1) {
        activeRipples.splice(i, 1);
      }
    }
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Main animation loop — throttled to every 2 frames.
   */
  function animationLoop(timestamp) {
    frameCount++;
    updateRipples(timestamp);

    if (frameCount % 2 === 0) {
      cacheParentRects();
      processCharProximity();
      processFloatingProximity();
    }

    requestAnimationFrame(animationLoop);
  }

  /**
   * Handle click ripple creation.
   */
  function handleClick(e) {
    activeRipples.push({
      x: e.clientX,
      y: e.clientY,
      startTime: performance.now(),
      currentRadius: 0,
    });
  }

  /**
   * Track mouse position.
   */
  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  // ── Initialize ──
  function init() {
    wrapCharacters();
    collectElements();

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    
    // Re-wrap and collect elements when dynamically generated grid tiles are ready
    document.addEventListener('heroGridInitialized', () => {
      wrapCharacters();
      collectElements();
    });

    requestAnimationFrame(animationLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
