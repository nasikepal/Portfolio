/**
 * ═══════════════════════════════════════════════════════
 *  HERO TILES — Dynamic Grid Tile Randomizer & Typewriter
 *  Generates an asymmetrical grid of tiles overlaying the
 *  Hero background. Randomizes graphic filters (heatmap,
 *  invert, depth map, ASCII) and drifts background alignment.
 *  Handles headline typewriter effect with blinking underscore cursor.
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Layout definitions in grid axes ──
  const GRID_LAYOUT = [
    { x: ['0', 'x1'], y: ['0', 'y2'] },   // Tile 0
    { x: ['x1', 'x2'], y: ['0', 'y1'] },  // Tile 1
    { x: ['x2', '100'], y: ['0', 'y2'] }, // Tile 2
    { x: ['x1', 'x2'], y: ['y1', 'y3'] }, // Tile 3
    { x: ['0', 'x1'], y: ['y2', 'y3'] },  // Tile 4
    { x: ['x2', 'x3'], y: ['y2', '100'] },// Tile 5
    { x: ['x3', '100'], y: ['y2', 'y3'] },// Tile 6
    { x: ['0', 'x2'], y: ['y3', '100'] }, // Tile 7
    { x: ['x3', '100'], y: ['y3', '100'] }// Tile 8
  ];

  const baseAxes = { x1: 33, x2: 50, x3: 83, y1: 25, y2: 50, y3: 75 };
  const currentAxes = { ...baseAxes };
  const targetAxes = { ...baseAxes };
  let axesTimer = 0;

  // ── Effects Weighting ──
  const EFFECTS = ['none', 'heatmap', 'invert', 'depth', 'ascii'];
  const EFFECT_WEIGHTS = [0.45, 0.12, 0.15, 0.13, 0.15]; // Weight distribution summing to 1

  // ── State variables ──
  const tileStates = [];
  let gridContainer = null;
  let animationFrameId = null;
  let frameCount = 0;

  // ── SVG Line Graph Elements ──
  let heroPathEl = null;
  let heroNode1El = null;
  let heroNode2El = null;
  let heroScannerEl = null;

  // (Video processing removed for performance optimization)
  /**
   * Select a random index based on weights.
   */
  function getRandomEffect() {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < EFFECTS.length; i++) {
      sum += EFFECT_WEIGHTS[i];
      if (r <= sum) return EFFECTS[i];
    }
    return 'none';
  }

  /**
   * Initialize grid elements.
   */
  function initGrid() {
    gridContainer = document.getElementById('hero-grid-tiles');
    if (!gridContainer) return;

    // (Click fallback removed)

    // Cache SVG Line Graph Elements
    heroPathEl = document.getElementById('hero-grid-path');
    heroNode1El = document.getElementById('hero-grid-node1');
    heroNode2El = document.getElementById('hero-grid-node2');
    heroScannerEl = document.getElementById('hero-grid-scanner');

    GRID_LAYOUT.forEach((layout) => {
      // 1. Create Tile element
      const tile = document.createElement('div');
      tile.className = 'hero-tile';

      // 2. Create inner wrapper (handles the negative translation to align masked content)
      const inner = document.createElement('div');
      inner.className = 'hero-tile-inner';
      inner.style.width = '100vw';
      inner.style.height = '100vh';

      // 3. Create Pre element for ASCII art
      const pre = document.createElement('pre');
      pre.className = 'hero-tile-ascii hidden';
      inner.appendChild(pre);

      tile.appendChild(inner);

      // 5. Create offscreen canvas metadata (used to determine width/height columns)
      const canvas = {
        width: 32, // character columns
        height: 18 // character rows
      };

      gridContainer.appendChild(tile);

      // 6. Push state tracking object
      tileStates.push({
        el: tile,
        innerEl: inner,
        preEl: pre,
        canvas: canvas,
        layout: layout,
        currentEffect: 'none',
        targetEffect: 'none',
        timer: Math.random() * 2000 // randomized staggered start timers for effects
      });
    });



    // Start rendering loops
    tick();
    
    // Bind ScrollTrigger for blur transition overlay
    initScrollTransition();

    // Dispatch custom event indicating grid is ready for ASCII character wrapping
    document.dispatchEvent(new CustomEvent('heroGridInitialized'));
  }

  /**
   * Real-time Random Tech ASCII Generator (No Image Dependency).
   * Creates scrolling streams of binary, hexadecimal, and grid characters.
   */
  function updateAscii(state, currentFrame) {
    // Throttle ASCII generation so it is readable and not too fast
    if (currentFrame % 5 !== 0) return;

    const cw = state.canvas.width;
    const ch = state.canvas.height;
    
    let asciiStr = '';
    const charPool = '01XY7F┌┐└┘┼+-*#=  ';
    const poolLen = charPool.length;

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        asciiStr += charPool[Math.floor(Math.random() * poolLen)];
      }
      asciiStr += '\n';
    }

    state.preEl.textContent = asciiStr;
  }

  /**
   * Calculates the vertical Y coordinate for a wave at horizontal position X and time t (seconds).
   */
  function getWaveY(x, t) {
    // Multi-harmonic sine/cosine wave for organic fluctuations
    const w1 = Math.sin(t * 1.5 + x * 0.08) * 9;
    const w2 = Math.cos(t * 2.2 + x * 0.15) * 4;
    const w3 = Math.sin(t * 0.7 - x * 0.04) * 6;
    return 50 + w1 + w2 + w3;
  }

  /**
   * Updates the wavy SVG line graph, nodes, and scanner position.
   */
  function updateLineGraph(now) {
    if (!heroPathEl) return;

    const t = now * 0.001; // convert ms to seconds

    // 1. Generate path data
    let d = `M 0,${getWaveY(0, t).toFixed(2)}`;
    for (let x = 1.5; x <= 100; x += 1.5) {
      d += ` L ${x.toFixed(1)},${getWaveY(x, t).toFixed(2)}`;
    }
    heroPathEl.setAttribute('d', d);

    // 2. Adjust static nodes vertically
    if (heroNode1El) {
      heroNode1El.setAttribute('cy', getWaveY(30, t).toFixed(2));
    }
    if (heroNode2El) {
      heroNode2El.setAttribute('cy', getWaveY(65, t).toFixed(2));
    }

    // 3. Move scanner dot horizontally and track wave height
    if (heroScannerEl) {
      const scannerX = (t * 15) % 100; // loop X from 0 to 100
      const scannerY = getWaveY(scannerX, t);
      heroScannerEl.setAttribute('cx', scannerX.toFixed(2));
      heroScannerEl.setAttribute('cy', scannerY.toFixed(2));
    }
  }

  /**
   * Main kinetic loop.
   */
  function tick() {
    frameCount++;

    // ── Update PNG Sequence Frame ──
    const now = performance.now();
    
    // ── Update Dynamic Line Graph ──
    updateLineGraph(now);

    // (Video frame update loop removed for performance optimization)

    // ── Update Grid Axes ──
    axesTimer -= 16.7;
    if (axesTimer <= 0) {
      targetAxes.x1 = baseAxes.x1 + (Math.random() * 20 - 10);
      targetAxes.x2 = baseAxes.x2 + (Math.random() * 20 - 10);
      targetAxes.x3 = baseAxes.x3 + (Math.random() * 20 - 10);
      targetAxes.y1 = baseAxes.y1 + (Math.random() * 20 - 10);
      targetAxes.y2 = baseAxes.y2 + (Math.random() * 20 - 10);
      targetAxes.y3 = baseAxes.y3 + (Math.random() * 20 - 10);
      axesTimer = 1500 + Math.random() * 1500;
    }

    Object.keys(currentAxes).forEach(k => {
      currentAxes[k] += (targetAxes[k] - currentAxes[k]) * 0.05;
    });

    tileStates.forEach((state) => {
      // ── Process target changes on staggered timer ──
      state.timer -= 16.7; // approximate deltaTime at 60fps
      if (state.timer <= 0) {
        state.targetEffect = getRandomEffect();
        
        const isGlitched = state.targetEffect !== 'none';
        state.timer = isGlitched ? (1000 + Math.random() * 1200) : (2500 + Math.random() * 3500);
      }

      // ── Apply shifting grid axes bounds ──
      const getVal = (v) => v === '0' ? 0 : v === '100' ? 100 : currentAxes[v];
      const left = getVal(state.layout.x[0]);
      const right = getVal(state.layout.x[1]);
      const top = getVal(state.layout.y[0]);
      const bottom = getVal(state.layout.y[1]);

      const w = right - left;
      const h = bottom - top;

      state.el.style.left = `${left}vw`;
      state.el.style.top = `${top}vh`;
      state.el.style.width = `${w}vw`;
      state.el.style.height = `${h}vh`;
      
      // ── Apply counter offset to inner wrapper so masked content stays fully aligned to viewport ──
      state.innerEl.style.transform = `translate(-${left}vw, -${top}vh)`;

      // ── Apply graphic effect tags ──
      if (state.currentEffect !== state.targetEffect) {
        // Remove old classes
        state.el.classList.remove('effect-heatmap', 'effect-invert', 'effect-depth', 'effect-ascii');
        state.preEl.classList.add('hidden');

        state.currentEffect = state.targetEffect;

        if (state.currentEffect === 'heatmap') {
          state.el.classList.add('effect-heatmap');
        } else if (state.currentEffect === 'invert') {
          state.el.classList.add('effect-invert');
        } else if (state.currentEffect === 'depth') {
          state.el.classList.add('effect-depth');
        } else if (state.currentEffect === 'ascii') {
          state.el.classList.add('effect-ascii');
          state.preEl.classList.remove('hidden');
        }
      }

      // ── Render ASCII frame ──
      if (state.currentEffect === 'ascii') {
        updateAscii(state, frameCount);
      }
    });

    animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Typewriter effect for Headline Title.
   * Types "ANDROMEDA", then "ASLAM" with a blipping underscore cursor.
   */
  function runTypewriter() {
    const lines1 = document.querySelectorAll('.title-line[data-line="1"]');
    const lines2 = document.querySelectorAll('.title-line[data-line="2"]');
    if (lines1.length === 0 || lines2.length === 0) return;

    const text1 = "HELLO IM";
    const text2 = "ANDROMEDA";

    // Clear all elements and add cursor
    lines1.forEach(line => {
      line.textContent = "";
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      cursor.textContent = '_';
      line.appendChild(cursor);
    });
    lines2.forEach(line => {
      line.textContent = "";
    });

    let idx1 = 0;
    function typeLine1() {
      if (idx1 < text1.length) {
        const char = text1[idx1];
        lines1.forEach(line => {
          const cursor = line.querySelector('.typing-cursor');
          if (cursor) {
            cursor.insertAdjacentText('beforebegin', char);
          }
        });
        idx1++;
        setTimeout(typeLine1, 100 + Math.random() * 60); // organic typing delay
      } else {
        // Line 1 done — wait and move cursor to Line 2
        setTimeout(() => {
          lines1.forEach(line => {
            const cursor = line.querySelector('.typing-cursor');
            if (cursor) line.removeChild(cursor);
          });
          lines2.forEach(line => {
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '_';
            line.appendChild(cursor);
          });
          typeLine2();
        }, 350);
      }
    }

    let idx2 = 0;
    function typeLine2() {
      if (idx2 < text2.length) {
        const char = text2[idx2];
        lines2.forEach(line => {
          const cursor = line.querySelector('.typing-cursor');
          if (cursor) {
            cursor.insertAdjacentText('beforebegin', char);
          }
        });
        idx2++;
        setTimeout(typeLine2, 100 + Math.random() * 60);
      } else {
        // Completed! Leave cursor blinking at the end of line 2
      }
    }

    // Start typing line 1
    setTimeout(typeLine1, 300);
  }

  // ── Typing trigger controller ──
  let typewriterStarted = false;
  function startTypewriter() {
    if (typewriterStarted) return;
    typewriterStarted = true;
    runTypewriter();
  }

  // Bind to custom preloader complete event
  document.addEventListener('preloaderComplete', startTypewriter);

  // Start typewriter immediately since preloader is removed
  startTypewriter();

  /**
   * Bind ScrollTrigger for pixelate and blur transition.
   * Runs smoothly as hero page scrolls out of view.
   */
  function initScrollTransition() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const transitionOverlay = document.getElementById('transition-overlay');
    const scrollIndicator = document.getElementById('scroll-indicator');

    if (scrollIndicator) {
      // Hide scroll indicator quickly
      gsap.to(scrollIndicator, {
        opacity: 0,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '20% top',
          scrub: true
        }
      });
    }


  }

  // ── Initialize on DOMContentLoaded ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGrid);
  } else {
    initGrid();
  }
})();
