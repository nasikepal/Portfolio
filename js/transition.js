/**
 * Custom SPA Transition Router & GSAP Animator
 */

(function () {
    'use strict';
  
    // Global overlay element
    let transitionOverlay = null;
  
    function initRouter() {
      bindLinks();
      
      // Handle back/forward buttons
      window.addEventListener('popstate', (e) => {
        handleNavigation(window.location.pathname, false, null);
      });
    }
  
    function bindLinks() {
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        // Only bind to local HTML links that don't have target="_blank"
        const href = link.getAttribute('href');
        if (
          href && 
          href.endsWith('.html') && 
          !link.hasAttribute('target') &&
          link.hostname === window.location.hostname // ensure local
        ) {
          // Prevent multiple bindings
          if (link.dataset.routerBound) return;
          link.dataset.routerBound = "true";
          
          link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(href, true, link);
          });
        }
      });
    }
  
    async function handleNavigation(url, pushHistory, clickedElement) {
      // Pre-fetch HTML concurrently with the animateOut transition
      const fetchPromise = fetch(url).then(res => res.text());
      
      // 1. ANIMATE OUT
      await animateOut(clickedElement);
  
      try {
        // 2. FETCH NEW HTML (Awaits the concurrent fetch)
        const html = await fetchPromise;
  
        // 3. PARSE HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
  
        // 4. SWAP DOM
        const newMain = doc.querySelector('#swup');
        const oldMain = document.querySelector('#swup');
        
        if (newMain && oldMain) {
          oldMain.replaceWith(newMain);
        }
        
        // Update Title
        if (doc.title) {
          document.title = doc.title;
        }
  
        // 5. UPDATE HISTORY
        if (pushHistory) {
          window.history.pushState(null, '', url);
        }
        
        // 6. EXECUTE INLINE SCRIPTS (Important for detail pages)
        const scripts = newMain.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        
        // Re-bind links on the new page
        bindLinks();
        
        // Call global initialization (from main.js) if it exists
        if (typeof window.initApp === 'function') {
          window.initApp();
        }
        
        // Reset scroll position
        window.scrollTo(0, 0);
  
      } catch (err) {
        console.error("SPA Navigation Error:", err);
        // Fallback to normal navigation if fetch fails
        window.location.href = url;
        return;
      }
  
      // 7. ANIMATE IN
      await animateIn();
    }
  
    function animateOut(clickedElement) {
      return new Promise((resolve) => {
        if (!transitionOverlay) {
          transitionOverlay = document.createElement('div');
          transitionOverlay.className = 'spa-overlay';
          Object.assign(transitionOverlay.style, {
            position: 'fixed',
            inset: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#050508',
            zIndex: '9999',
            pointerEvents: 'none',
            opacity: '0',
            transformOrigin: 'center center'
          });
          document.body.appendChild(transitionOverlay);
        }
  
        // If clicking an accordion panel, do an "expand" animation
        if (clickedElement && clickedElement.classList.contains('accordion-panel')) {
          const rect = clickedElement.getBoundingClientRect();
          const trackImage = clickedElement.querySelector('.panel-bg');
          let bgImage = 'none';
          if (trackImage) {
            bgImage = window.getComputedStyle(trackImage).backgroundImage;
          }
          
          // Initial state of overlay matches the clicked panel exactly
          Object.assign(transitionOverlay.style, {
            top: rect.top + 'px',
            left: rect.left + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            opacity: '1',
            borderRadius: '1px',
            backgroundColor: '#050508',
            backgroundImage: 'none',
            overflow: 'hidden'
          });

          // Create a child div to hold the image at fixed original size
          const imgChild = document.createElement('div');
          Object.assign(imgChild.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: rect.width + 'px',
            height: rect.height + 'px',
            backgroundImage: bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '1'
          });
          
          transitionOverlay.innerHTML = '';
          transitionOverlay.appendChild(imgChild);
          
          // Expand the black overlay to fill screen
          gsap.to(transitionOverlay, {
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            duration: 0.6,
            ease: 'expo.inOut',
            onComplete: resolve
          });
          
          // Simultaneously fade out the image so it doesn't get stretched/scaled weirdly
          gsap.to(imgChild, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut'
          });
        } else {
          // Normal fade out (e.g. Back button)
          Object.assign(transitionOverlay.style, {
            top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: '0'
          });
          
          gsap.to(transitionOverlay, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: resolve
          });
        }
      });
    }
  
    function animateIn() {
      return new Promise((resolve) => {
        if (!transitionOverlay) {
          resolve();
          return;
        }
        
        gsap.to(transitionOverlay, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: resolve
        });
      });
    }
  
    // Boot up
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initRouter);
    } else {
      initRouter();
    }
  
  })();
