/**
 * ═══════════════════════════════════════════════════════
 *  MAIN.JS — Portfolio Application Controller
 *  Preloader, cursor, navigation, filtering,
 *  scroll animations, contact form, and more.
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Touch device detection ──
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ═══════════════════════════════════════════════════════
   *  1. PRELOADER
   * ═══════════════════════════════════════════════════════ */

  function initPreloader(onComplete) {
    const preloader = document.getElementById('preloader');
    const preloaderNumber = document.getElementById('preloader-number');
    const preloaderBarFill = document.getElementById('preloader-bar-fill');

    if (!preloader || !preloaderNumber || !preloaderBarFill) {
      if (onComplete) onComplete();
      return;
    }

    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const count = Math.floor(progress * 100);

      preloaderNumber.textContent = count;
      preloaderBarFill.style.width = progress * 100 + '%';
      preloader.style.setProperty('--progress', progress * 100 + '%');

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Counter reached 100 — hide preloader
        preloaderNumber.textContent = '100';
        preloaderBarFill.style.width = '100%';

        // Small delay before hiding for visual polish
        setTimeout(() => {
          preloader.classList.add('hidden');
          // After CSS transition completes, remove from flow
          setTimeout(() => {
            preloader.style.display = 'none';
            if (onComplete) onComplete();
            document.dispatchEvent(new CustomEvent('preloaderComplete'));
          }, 600);
        }, 300);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /* ═══════════════════════════════════════════════════════
   *  2. CUSTOM CURSOR
   * ═══════════════════════════════════════════════════════ */

  function initCustomCursor() {
    if (isTouchDevice) {
      const cursor = document.getElementById('custom-cursor');
      if (cursor) cursor.style.display = 'none';
      return;
    }

    const cursorEl = document.getElementById('custom-cursor');
    const cursorDot = cursorEl ? cursorEl.querySelector('.cursor-dot') : null;
    const cursorRing = cursorEl ? cursorEl.querySelector('.cursor-ring') : null;
    const cursorCoords = cursorEl ? cursorEl.querySelector('.cursor-coords') : null;
    const trailDots = cursorEl ? Array.from(cursorEl.querySelectorAll('.cursor-trail-dot')) : [];

    if (!cursorDot || !cursorRing) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    const LERP = 0.12;

    // Track cursor history for trails
    const mouseHistory = [];
    const maxHistory = 16;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Hover targets — add cursor-hover class for interactive elements
    const hoverTargets = 'a, button, .work-item, .filter-btn, .folder-btn, .folder-strip';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.add('cursor-hover');
      }
    }, { passive: true });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.remove('cursor-hover');
      }
    }, { passive: true });

    // Hide cursor when it leaves the window
    document.addEventListener('mouseleave', () => {
      cursorEl.style.opacity = '0';
    }, { passive: true });
    document.addEventListener('mouseenter', () => {
      cursorEl.style.opacity = '1';
    }, { passive: true });

    // Click ripple effect
    document.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      document.body.appendChild(ripple);
      
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      
      requestAnimationFrame(() => {
        ripple.classList.add('active');
      });
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Animation loop
    function updateCursor() {
      // Add current position to history
      mouseHistory.push({ x: mouseX, y: mouseY });
      if (mouseHistory.length > maxHistory) {
        mouseHistory.shift();
      }

      // Dot follows directly
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      // Coords text follows directly
      if (cursorCoords) {
        cursorCoords.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        cursorCoords.textContent = `[ X: ${mouseX.toFixed(0).padStart(4, '0')} | Y: ${mouseY.toFixed(0).padStart(4, '0')} ]`;
      }

      // Ring follows with lerp
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;

      // Trail dots follow with delay offsets from history
      const offsets = [4, 8, 12];
      trailDots.forEach((dot, index) => {
        const historyIdx = Math.max(0, mouseHistory.length - 1 - offsets[index]);
        const pt = mouseHistory[historyIdx];
        if (pt) {
          dot.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        }
      });

      requestAnimationFrame(updateCursor);
    }

    requestAnimationFrame(updateCursor);
  }

  /* ═══════════════════════════════════════════════════════
   *  3. NAVBAR
   * ═══════════════════════════════════════════════════════ */

  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [];

    // Collect sections referenced by nav links
    navLinks.forEach((link) => {
      const sectionId = link.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) {
        sections.push({ id: sectionId, el: section, link: link });
      }
    });

    function onScroll() {
      // 📱 Scrolled state 📱
      if (window.scrollY > window.innerHeight - 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // ── Active section tracking ──
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      let activeSection = null;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPos >= sections[i].el.offsetTop) {
          activeSection = sections[i];
          break;
        }
      }

      navLinks.forEach((link) => link.classList.remove('active'));
      if (activeSection) {
        activeSection.link.classList.add('active');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check
  }

  /* ═══════════════════════════════════════════════════════
   *  4. MOBILE MENU
   * ═══════════════════════════════════════════════════════ */

  function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

    function toggleMenu() {
      const isOpen = hamburger.classList.contains('active');

      if (isOpen) {
        // Close
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      } else {
        // Open
        hamburger.classList.add('active');
        mobileMenu.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);

    // Close menu on link click
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  5. SMOOTH SCROLL
   * ═══════════════════════════════════════════════════════ */

  function initSmoothScroll() {
    const navbar = document.getElementById('navbar');
    const navHeight = navbar ? navbar.offsetHeight : 0;

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offsetTop = target.offsetTop - navHeight;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------------------------------
   *  12. SMOOTH SCROLL (Lenis)
   * ------------------------------------------------------------------------- */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* -------------------------------------------------------------------------
   *  13. SCRAMBLE TEXT ON SCROLL
   * ------------------------------------------------------------------------- */
  class NaturalTypewriter {
    constructor(el) {
      this.el = el;
      this.originalText = el.textContent.trim();
      this.isAnimating = false;
      this.el.style.opacity = '0';
      this.queue = [];
      this.currentIndex = 0;
      this.currentText = '';

      this.buildQueue();
    }
    
    buildQueue() {
      let typoCount = this.originalText.length > 20 ? Math.floor(Math.random() * 2) + 1 : 0;
      let typoIndices = [];
      for(let i=0; i<typoCount; i++) {
         typoIndices.push(Math.floor(Math.random() * (this.originalText.length - 2)) + 1);
      }
      
      const keyboardNear = 'qwertyuiopasdfghjklzxcvbnm';
      
      for (let i = 0; i < this.originalText.length; i++) {
        const char = this.originalText[i];
        
        if (typoIndices.includes(i) && char !== ' ' && char !== '\n' && char !== '.') {
           let wrongChar = keyboardNear[Math.floor(Math.random() * keyboardNear.length)];
           if (char === char.toUpperCase()) wrongChar = wrongChar.toUpperCase();
           
           this.queue.push({ type: 'add', char: wrongChar });
           this.queue.push({ type: 'pause', delay: 150 });
           this.queue.push({ type: 'delete' });
           this.queue.push({ type: 'pause', delay: 100 });
        }
        
        this.queue.push({ type: 'add', char: char });
        
        if (char === ' ' || char === '.' || char === ',') {
           this.queue.push({ type: 'pause', delay: Math.random() * 50 + 30 });
        }
      }
    }
    
    start() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      this.currentIndex = 0;
      this.currentText = '';
      this.el.style.opacity = '1';
      this.el.textContent = '';
      this.processQueue();
    }
    
    processQueue() {
      if (this.currentIndex >= this.queue.length) {
        this.isAnimating = false;
        this.el.textContent = this.currentText; // Remove cursor at end
        return;
      }
      
      const action = this.queue[this.currentIndex];
      this.currentIndex++;
      
      let nextDelay = Math.random() * 30 + 15; // Fast typing speed
      
      if (action.type === 'add') {
        this.currentText += action.char;
        this.el.textContent = this.currentText + '█';
      } else if (action.type === 'delete') {
        this.currentText = this.currentText.slice(0, -1);
        this.el.textContent = this.currentText + '█';
        nextDelay = 50;
      } else if (action.type === 'pause') {
        nextDelay = action.delay;
      }
      
      setTimeout(() => this.processQueue(), nextDelay);
    }
  }

  function initNaturalTypingOnScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const selectors = [
      '#about p', '#about span:not(.marquee-icon)', '#about h2', '#about h3', '#about li',
      '#portfolio p', '#portfolio span', '#portfolio h2', '#portfolio h3', '.track-num', '.file-name',
      '#contact p', '#contact span', '#contact h2', '#contact h3', '.footer-copy', '.social-link',
      '.brutalist-label', '.brutalist-content span'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(el => {
      // Only target elements with no HTML children (just text)
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        // Skip dots, lines, and specific elements
        if (el.classList.contains('dot') || el.classList.contains('ascii-accent') || el.classList.contains('label-line') || el.classList.contains('submit-arrow')) return;
        
        const typewriter = new NaturalTypewriter(el);
        
        if (el.closest('.about-accordion-content')) {
          el._typewriter = typewriter;
        } else {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 95%',
            once: true,
            onEnter: () => {
              typewriter.start();
            }
          });
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  6. PORTFOLIO FILTER
   * ═══════════════════════════════════════════════════════ */

  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');

    if (!filterBtns.length || !workItems.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter items
        workItems.forEach((item) => {
          const category = item.dataset.category;
          const shouldShow = filter === 'all' || category === filter;

          if (shouldShow) {
            // Show: set display first, then animate in
            item.style.display = '';
            // Force reflow for transition
            void item.offsetHeight;
            item.classList.remove('work-hidden');
            item.classList.add('work-visible');
          } else {
            // Hide: animate out, then set display none
            item.classList.remove('work-visible');
            item.classList.add('work-hidden');
            setTimeout(() => {
              if (item.classList.contains('work-hidden')) {
                item.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });

    // Initialize: all items visible
    workItems.forEach((item) => {
      item.classList.add('work-visible');
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  7. SCROLL REVEAL (GSAP ScrollTrigger)
   * ═══════════════════════════════════════════════════════ */

  function initScrollReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const revealEls = document.querySelectorAll('[data-reveal]:not(.brutalist-row)');

    revealEls.forEach((el) => {
      // Set initial state
      gsap.set(el, { opacity: 0, y: 30 });

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    // ── Special Scale Reveal for Brutalist Rows ──
    const rowRevealEls = document.querySelectorAll('.brutalist-row[data-reveal]');
    rowRevealEls.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 40, scale: 0.96 });
      
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 60%', // triggers when 40% into view (60% from top)
          once: true,
        },
      });
    });

    // ── Staggered reveals for sibling groups ──
    const staggerGroups = [
      '.about-details .detail-item',
      '.about-stats .stat-item',
      '.about-skills .skill-tag',
      '.social-links .social-link',
    ];

    staggerGroups.forEach((selector) => {
      const items = document.querySelectorAll(selector);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 20 });

      ScrollTrigger.create({
        trigger: items[0].parentElement,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  8. STAT COUNTER ANIMATION
   * ═══════════════════════════════════════════════════════ */

  function initStatCounters() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    statNumbers.forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;

      const counter = { value: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.floor(counter.value);
            },
            onComplete: () => {
              el.textContent = target;
            },
          });
        },
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  9. CONTACT FORM
   * ═══════════════════════════════════════════════════════ */

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit');

    if (!form || !submitBtn) return;

    const submitText = submitBtn.querySelector('.submit-text');
    const originalText = submitText ? submitText.textContent : 'SEND MESSAGE';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitText) {
        submitText.textContent = 'SENDING...';
        submitBtn.style.pointerEvents = 'none';
      }

      const formData = new FormData(form);
      // Optional: add a subject line or disable captcha if needed
      formData.append('_subject', 'New Contact Form Submission');
      formData.append('_captcha', 'false');

      fetch("https://formsubmit.co/ajax/andromedaaslam@gmail.com", {
        method: "POST",
        headers: { 
            'Accept': 'application/json'
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Show confirmation
        if (submitText) {
          submitText.textContent = 'SENT ↗';
          submitBtn.classList.add('sent');
        }

        // Reset after 3 seconds
        setTimeout(() => {
          if (submitText) {
            submitText.textContent = originalText;
            submitBtn.classList.remove('sent');
            submitBtn.style.pointerEvents = 'auto';
          }
          form.reset();
        }, 3000);
      })
      .catch(error => {
        console.log(error);
        if (submitText) {
          submitText.textContent = 'ERROR';
        }
        setTimeout(() => {
          if (submitText) {
            submitText.textContent = originalText;
            submitBtn.style.pointerEvents = 'auto';
          }
        }, 3000);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  10. BACK TO TOP
   * ═══════════════════════════════════════════════════════ */

  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  ABOUT ACCORDION
   * ═══════════════════════════════════════════════════════ */

  function initAboutAccordion() {
    const headers = document.querySelectorAll('.about-accordion-header');
    
    // Auto-update height if content changes size (e.g. font load or window resize)
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const content = entry.target.parentElement;
        if (content.style.maxHeight && content.style.maxHeight !== '0px') {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });

    document.querySelectorAll('.about-accordion-content .content-inner').forEach(inner => {
      resizeObserver.observe(inner);
    });

    headers.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');
        
        // Close all
        document.querySelectorAll('.about-accordion-content').forEach(c => {
          c.style.maxHeight = null;
        });
        document.querySelectorAll('.about-accordion-header').forEach(h => {
          h.classList.remove('active');
          h.style.color = '#e0e0e0';
        });
        
        // Open the clicked one if it wasn't active
        if (!isActive) {
          header.classList.add('active');
          header.style.color = '#fff';
          content.style.maxHeight = content.scrollHeight + 'px';
          
          content.querySelectorAll('*').forEach(el => {
            if (el._typewriter) {
              setTimeout(() => el._typewriter.start(), 200);
            }
          });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  11. INITIALIZE EVERYTHING
   * ═══════════════════════════════════════════════════════ */

  function initApp() {
    // These run immediately (don't depend on preloader)
    initCustomCursor();
    initNavbar();
    initMobileMenu();
    initLenis();
    initBackToTop();
    initContactForm();
    initAboutAccordion();
    
    // These run after a tiny delay to ensure DOM is painted
    requestAnimationFrame(() => {
      initPortfolioFilter();
      initScrollReveal();
      initStatCounters();
      initNaturalTypingOnScroll();
    });
  }

  // Export globally so SPA router can re-initialize scripts
  window.initApp = initApp;

  function init() {
    initApp();
  }

  // ── DOMContentLoaded ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
