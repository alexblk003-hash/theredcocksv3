
    (function(){
      function setVH(){
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
      }
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
    })();
  

/* ---- next inline block ---- */


    (function(){
      let touchStartY = 0;
      window.addEventListener('touchstart', function(e){
        if (e.touches.length === 1) touchStartY = e.touches[0].clientY;
      }, { passive: true });
      window.addEventListener('touchmove', function(e){
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        const pullingDown = e.touches[0].clientY > touchStartY;
        if (scrollTop <= 0 && pullingDown) {
          e.preventDefault();
        }
      }, { passive: false });
    })();
  

/* ---- next inline block ---- */


  (function(){
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile3D = window.innerWidth <= 768;

    /* ---------- HERO ENTRANCE (plain CSS, no library) ----------
       This used to load GSAP + ScrollTrigger (~70KB of JS, two extra
       blocking network requests) just to fade/rise a couple of hero
       elements in on load — everything ScrollTrigger did beyond that was
       already redundant with the .scroll-section.active CSS reveal (see
       below), so the whole library was dead weight. Same visual result,
       zero extra library. */
    if (!reduceMotion) {
      const heroEls = document.querySelectorAll('#home h1, #home .inline-block');
      heroEls.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)';
        el.style.transitionDelay = (0.2 + i * 0.15) + 's';
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        heroEls.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      }));
    }

    /* ---------- LIGHTWEIGHT CSS HERO PARTICLE FIELD (no WebGL) ----------
       Replaces the old Three.js WebGL particle renderer. Pure CSS
       transform + opacity animations (compositor-only, GPU-cheap),
       so it costs almost nothing even on low-end phones. A light
       cursor-parallax on the whole layer gives the same "living 3D"
       feel without ever touching WebGL. */
    (function initHeroParticles() {
      const canvas = document.getElementById('hero-three-canvas');
      const heroSection = document.getElementById('home');
      if (!canvas || !heroSection) return;

      const layer = document.createElement('div');
      layer.id = 'hero-particle-layer';
      layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;will-change:transform;';
      canvas.replaceWith(layer);

      if (reduceMotion) return;

      // Fewer particles on phones, and no box-shadow on them there — a
      // per-particle box-shadow can't be GPU-composited like transform/
      // opacity can, so it repaints every frame; with ~20+ of them that adds
      // up to real scroll jank on phone-class GPUs. Desktop keeps the glow.
      const COUNT = isMobile3D ? 14 : 55;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < COUNT; i++) {
        const p = document.createElement('span');
        const size = (Math.random() * 2.2 + 1).toFixed(1);
        const left = (Math.random() * 100).toFixed(2);
        const top = (Math.random() * 100).toFixed(2);
        const dur = (Math.random() * 10 + 9).toFixed(1);
        const delay = (Math.random() * -20).toFixed(1);
        const depth = (Math.random() * 0.7 + 0.3).toFixed(2); // parallax strength
        p.dataset.depth = depth;
        const glow = isMobile3D ? '' : 'box-shadow:0 0 6px 1px rgba(168,67,46,.5);';
        p.style.cssText = `position:absolute;left:${left}%;top:${top}%;width:${size}px;height:${size}px;border-radius:50%;background:#A8432E;opacity:.55;${glow}animation:heroParticleFloat ${dur}s ease-in-out ${delay}s infinite;`;
        frag.appendChild(p);
      }
      layer.appendChild(frag);

      if (!document.getElementById('hero-particle-kf')) {
        const style = document.createElement('style');
        style.id = 'hero-particle-kf';
        style.textContent = '@keyframes heroParticleFloat{0%,100%{transform:translateY(0) translateX(0);opacity:.35}50%{transform:translateY(-18px) translateX(6px);opacity:.75}}#hero-particle-layer.paused span{animation-play-state:paused;}';
        document.head.appendChild(style);
      }

      // Only animate/parallax while hero is on screen. NOTE: each particle
      // <span> carries its own inline `animation`, so toggling play-state on
      // the parent layer alone does nothing — it has to be a class that
      // cascades to the children (see #hero-particle-layer.paused rule above).
      let heroVisible = true;
      new IntersectionObserver((entries) => {
        entries.forEach(e => { heroVisible = e.isIntersecting; });
        layer.classList.toggle('paused', !heroVisible);
      }, { threshold: 0 }).observe(heroSection);

      // Cheap cursor-parallax: one transform write per frame, desktop only.
      if (!isTouch) {
        let targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null;
        heroSection.addEventListener('mousemove', (e) => {
          const rect = heroSection.getBoundingClientRect();
          targetX = (((e.clientX - rect.left) / rect.width) - 0.5) * 14;
          targetY = (((e.clientY - rect.top) / rect.height) - 0.5) * 10;
          if (!raf) raf = requestAnimationFrame(tick);
        });
        function tick() {
          raf = null;
          if (!heroVisible) return;
          curX += (targetX - curX) * 0.06;
          curY += (targetY - curY) * 0.06;
          layer.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
          if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
            raf = requestAnimationFrame(tick);
          }
        }
      }
    })();

    /* NOTE: the 3D tilt-on-hover for glass cards (initCardTilt) and the
       hero video parallax tilt (initHeroTilt) were removed here — they
       rotated cards/the hero video toward the mouse pointer across every
       section, which read as everything "moving" with the cursor. Static
       now; hover/scroll animations elsewhere are untouched. */
  })();
  

/* ---- next inline block ---- */


    const isMobilePerf = window.innerWidth <= 768;
    const tintLayer = document.getElementById('canvas3d-container');
    const sections = document.querySelectorAll('.scroll-section');


    // SCROLL COLOR JOURNEY: background tint drifts smoothly through this
    // sequence as you scroll down — pink -> magenta -> hot pink -> rose -> pink.
    const scrollColorStops = [
      [244, 114, 182],  // pink
      [236, 72, 153],  // magenta pink
      [219, 39, 119],  // hot pink
      [236, 72, 153],  // rose pink
      [244, 114, 182]   // back to pink
    ];
    function getScrollColor(t) {
      const clamped = Math.min(Math.max(t, 0), 1);
      const segments = scrollColorStops.length - 1;
      const scaled = clamped * segments;
      const idx = Math.min(Math.floor(scaled), segments - 1);
      const localT = scaled - idx;
      const a = scrollColorStops[idx], b = scrollColorStops[idx + 1];
      const r = Math.round(a[0] + (b[0] - a[0]) * localT);
      const g = Math.round(a[1] + (b[1] - a[1]) * localT);
      const bl = Math.round(a[2] + (b[2] - a[2]) * localT);
      return 'rgb(' + r + ',' + g + ',' + bl + ')';
    }

    // Videos only start decoding/playing once their section actually scrolls
    // into view (below), instead of every video on the page starting to
    // buffer at once on load — this keeps initial page load fast and light.

    // FIX: the old mobile rootMargin ('0px 0px -10% 0px') shrank the
    // effective viewport from the bottom, which meant a section only
    // counted as "intersecting" once the user had scrolled it well past
    // where it visually appears — sections sat invisible (opacity:0 from
    // .scroll-section) for an extra beat after they were already on
    // screen, which is exactly the "sections show late on phone" glitch.
    // A small POSITIVE bottom margin does the opposite: it starts the
    // reveal slightly before the section reaches the bottom edge of the
    // screen, so by the time it's actually visible it's already animating
    // in — feels instant and in sync with the scroll instead of lagging.
    const observerOptions = {
      root: null,
      rootMargin: isMobilePerf ? '0px 0px 10% 0px' : '-5% 0px -5% 0px',
      threshold: isMobilePerf ? 0.01 : 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionVideos = entry.target.querySelectorAll('video');

        if(entry.isIntersecting) {
          entry.target.classList.add('active');
          // First time this section is seen: lock its cinematic entrance
          // in place permanently (opacity/transform/blur settle to final
          // state) so it never replays on later scroll-backs — only the
          // much smaller .lux-exiting dimming (below) reverses.
          entry.target.classList.add('lux-locked');
          entry.target.classList.remove('lux-exiting');

          // Only decode/play videos for sections actually on screen
          sectionVideos.forEach(v => v.play().catch(() => {}));
        } else {
          entry.target.classList.remove('active');
          // Quiet, subtle "leaving" dim — only once it's already been
          // revealed at least once; never applies before the first reveal.
          if (entry.target.classList.contains('lux-locked')) {
            entry.target.classList.add('lux-exiting');
          }

          sectionVideos.forEach(v => v.pause());
        }
      });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));

    // SAFETY NET: on some phones (very slow devices, or a section already
    // sitting in the initial viewport before the observer has finished
    // registering) the very first "active" toggle can lag behind the
    // frame the user actually sees. Force-reveal anything that's already
    // on screen shortly after load so nothing is ever left invisible.
    setTimeout(() => {
      sections.forEach(sec => {
        if (sec.classList.contains('active')) return;
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          sec.classList.add('active');
          sec.classList.add('lux-locked');
        }
      });
    }, 1200);

    // EARLY VIDEO BUFFERING: give each below-fold video a generous head start
    // — start it decoding while it's still well below the visible screen, so
    // by the time the user actually scrolls to it, it's already smoothly
    // playing instead of looking frozen/late. Independent of the section
    // reveal-animation observer above, so that animation's timing is untouched.
    const bufferMargin = isMobilePerf ? '0px 0px 15% 0px' : '0px 0px 40% 0px';
    const videoBufferObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto';
          v.play().catch(() => {});
        } else if (entry.boundingClientRect.top > 0) {
          // Only pause videos we've scrolled PAST upward-off-screen content
          // stays paused via the section observer above; this just avoids
          // fighting that logic for videos far below the fold.
        }
      });
    }, { root: null, rootMargin: bufferMargin, threshold: 0 });

    document.querySelectorAll('video.lazy-below-video').forEach(v => videoBufferObserver.observe(v));

    // Scroll tint is throttled to one write per animation frame (rAF), so it
    // never runs more than the browser's own paint rate — cheap on any device.
    let tintTicking = false;
    const depthOrbs = document.querySelectorAll('.depth-orb');
    // Each orb drifts at its own speed/rotation so they don't move in lockstep
    // — that's what actually reads as depth (near things appear to move more
    // than far things) rather than one flat layer sliding as a block.
    const orbSpeeds = [0.10, -0.16, 0.13];
    const orbRotSpeeds = [10, -14, 8];
    const orbDepths = [-120, -220, -70]; // px, matches each .depth-orb--n's CSS translateZ
    function updateScrollTint() {
      tintTicking = false;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) : 0;
      if (tintLayer) {
        tintLayer.style.setProperty('--scroll-tint', getScrollColor(scrollProgress));
        // A very small perspective tilt + zoom tied to scroll position —
        // subtle enough to never feel dizzy, but enough that the whole
        // backdrop reads as a 3D plane shifting under the content instead
        // of a static flat color, on phone as much as desktop.
        const tilt = Math.sin(scrollProgress * Math.PI * 3) * 1.6;
        const zoom = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.03;
        tintLayer.style.transform = 'perspective(1400px) rotateX(' + tilt.toFixed(2) + 'deg) scale(' + zoom.toFixed(3) + ')';
      }
      depthOrbs.forEach((orb, i) => {
        const wave = Math.sin(scrollProgress * Math.PI * 2 + i * 1.7);
        const y = wave * 60 * (1 + i * 0.4);
        const rot = scrollProgress * orbRotSpeeds[i];
        const drift = window.scrollY * orbSpeeds[i] * 0.05;
        orb.style.transform = 'translate3d(0, ' + (y - drift % 80).toFixed(1) + 'px, ' + orbDepths[i] + 'px) rotate(' + rot.toFixed(1) + 'deg)';
      });
    }
    window.addEventListener('scroll', () => {
      if (!tintTicking) {
        tintTicking = true;
        requestAnimationFrame(updateScrollTint);
      }
    }, { passive: true });
    updateScrollTint();

    // PRO-LEVEL NAVBAR: compact + intensify once scrolled past the hero area.
    const navEl = document.querySelector('nav');
    let navTicking = false;
    function updateNavState() {
      navTicking = false;
      if (navEl) navEl.classList.toggle('nav-scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', () => {
      if (!navTicking) {
        navTicking = true;
        requestAnimationFrame(updateNavState);
      }
    }, { passive: true });
    updateNavState();

    // NAV SCROLL-PROGRESS RING: the ring around the logo traces real scroll
    // position (0 → 100%) using its stroke-dashoffset — a live, functional
    // detail rather than a purely decorative one.
    (function initNavRing() {
      const ringFg = document.getElementById('nav-scroll-ring-fg');
      if (!ringFg) return;
      const CIRCUMFERENCE = 2 * Math.PI * 21.5; // matches r="21.5" in the SVG
      let ringTicking = false;
      function updateRing() {
        ringTicking = false;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1) : 0;
        ringFg.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
      }
      ringFg.style.strokeDasharray = String(CIRCUMFERENCE);
      window.addEventListener('scroll', () => {
        if (!ringTicking) { ringTicking = true; requestAnimationFrame(updateRing); }
      }, { passive: true });
      window.addEventListener('resize', updateRing);
      updateRing();
    })();

    // NAV ACTIVE-SECTION PILL: glides under whichever nav link matches the
    // section currently in view, using the same section elements already
    // tracked by the reveal/video IntersectionObservers above.
    (function initNavPill() {
      const wrap = document.getElementById('nav-links-wrap');
      const pill = document.getElementById('nav-active-pill');
      if (!wrap || !pill) return;
      const linkMap = {};
      wrap.querySelectorAll('.elite-nav-link').forEach(a => { linkMap[a.dataset.section] = a; });
      let currentLink = linkMap['home'];

      function movePillTo(link) {
        if (!link) return;
        currentLink = link;
        pill.style.left = link.offsetLeft + 'px';
        pill.style.width = link.offsetWidth + 'px';
        pill.classList.add('ready');
      }

      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = linkMap[entry.target.id];
            if (link) movePillTo(link);
          }
        });
      }, { root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0 });

      Object.keys(linkMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) navObserver.observe(el);
      });

      // Keep the pill aligned on resize (link positions shift with layout).
      window.addEventListener('resize', () => movePillTo(currentLink));
    })();

    // NAV MAGNETIC LINKS + CURSOR SPOTLIGHT: desktop-only polish — links
    // nudge gently toward the cursor, and a soft light follows the mouse
    // across the glass navbar. Skipped for touch devices entirely.
    (function initNavMagnetAndSpotlight() {
      const isTouchNav = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const reduceMotionNav = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isTouchNav || reduceMotionNav) return;

      const navBox = document.querySelector('.elite-nav-box');
      if (navBox) {
        navBox.addEventListener('mousemove', (e) => {
          const rect = navBox.getBoundingClientRect();
          navBox.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
          navBox.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
          navBox.style.setProperty('--spot-opacity', '1');
        });
        navBox.addEventListener('mouseleave', () => {
          navBox.style.setProperty('--spot-opacity', '0');
        });
      }

      document.querySelectorAll('.elite-nav-link').forEach(link => {
        link.addEventListener('mousemove', (e) => {
          const rect = link.getBoundingClientRect();
          const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
          const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
          link.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        });
        link.addEventListener('mouseleave', () => {
          link.style.transform = '';
        });
      });
    })();

    // MOBILE HAMBURGER MENU: toggles the floating glass dropdown panel.
    (function initMobileNavMenu() {
      const btn = document.getElementById('nav-hamburger-btn');
      const wrap = document.getElementById('nav-links-wrap');
      const scrim = document.getElementById('nav-menu-scrim');
      if (!btn || !wrap || !scrim) return;

      // The nav's own transform + overflow:hidden would otherwise become the
      // containing block for a position:fixed child, breaking the panel's
      // viewport-relative top/left. Re-parenting to <body> on mobile avoids
      // that entirely; on desktop it's moved back so the normal flex pill
      // nav layout (and the active-section pill under it) is untouched.
      const navParent = wrap.parentElement;
      const navNextSibling = wrap.nextSibling;
      let movedOut = false;

      function closeMenu() {
        wrap.classList.remove('mobile-open');
        scrim.classList.remove('visible');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
      function openMenu() {
        wrap.classList.add('mobile-open');
        scrim.classList.add('visible');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
      function ensurePlacement() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !movedOut) {
          document.body.appendChild(scrim);
          document.body.appendChild(wrap);
          movedOut = true;
        } else if (!isMobile && movedOut) {
          navParent.insertBefore(wrap, navNextSibling);
          movedOut = false;
          closeMenu();
        }
      }

      btn.addEventListener('click', () => {
        wrap.classList.contains('mobile-open') ? closeMenu() : openMenu();
      });
      scrim.addEventListener('click', closeMenu);
      wrap.querySelectorAll('.elite-nav-link').forEach(a => a.addEventListener('click', closeMenu));
      window.addEventListener('resize', ensurePlacement);
      ensurePlacement();
    })();
  

/* ---- next inline block ---- */


  (function(){
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update(){
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();
  

/* ---- next inline block ---- */


  function copyContactEmail(btn) {
    const emailEl = document.getElementById('contact-email-text');
    if (!emailEl) return;
    const email = emailEl.textContent.trim();
    const restoreLabel = btn.textContent;
    function showCopied() {
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = restoreLabel; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(showCopied).catch(showCopied);
    } else {
      showCopied();
    }
  }
  

/* ---- next inline block ---- */


  (function(){
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- 1. PRELOADER ---------- */
    const preloader = document.getElementById('site-preloader');
    const wordEl = document.getElementById('preloader-word');
    const barFill = document.getElementById('preloader-bar-fill');
    const pctCenter = document.getElementById('preloader-pct-center');
    const statusSpans = preloader ? preloader.querySelectorAll('#preloader-status span') : [];
    const BRAND = 'THE RED COCKS';

    function setProgress(pct){
      if (barFill) barFill.style.width = pct.toFixed(0) + '%';
      if (pctCenter) {
        pctCenter.textContent = pct.toFixed(0);
        pctCenter.classList.remove('tick');
        void pctCenter.offsetWidth; // restart the flicker animation each tick
        pctCenter.classList.add('tick');
      }
      // Swap the status line's active phrase at rough thirds of progress —
      // gives the wait a sense of stages instead of one static caption.
      const stage = pct > 66 ? 2 : pct > 30 ? 1 : 0;
      statusSpans.forEach((s, i) => s.classList.toggle('active', i === stage));
    }

    function revealHeroLetters(){
      const target = document.getElementById('hero-letters-target');
      if (!target || target.dataset.split) return;
      target.dataset.split = '1';
      const text = target.textContent;
      target.textContent = '';
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = (i * 0.045) + 's';
        target.appendChild(span);
      });
    }

    if (reduceMotion || !preloader) {
      if (preloader) preloader.remove();
      revealHeroLetters();
    } else {
      [...BRAND].forEach((ch, i) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = (i * 0.04) + 's';
        wordEl.appendChild(span);
      });
      // Once every letter has landed, switch the wordmark to the site's
      // signature gold/pink shimmer — ties the loader visually to every
      // heading on the page instead of feeling like a separate splash screen.
      setTimeout(() => {
        wordEl.classList.add('gold-shimmer-text', 'glitch-once');
        setTimeout(() => wordEl.classList.remove('glitch-once'), 450);
      }, BRAND.length * 40 + 700);

      let pct = 0;
      setProgress(0);
      const tick = setInterval(() => {
        pct = Math.min(pct + Math.random() * 16, 96);
        setProgress(pct);
      }, 150);

      // FIX: setProgress(100) used to be called directly, which snapped the
      // bar/counter straight from wherever it happened to be (often ~40-70%)
      // to 100% in a single frame — that instant jump is the "glitch" feel.
      // Ramping it over a few short frames makes the finish read as a fast
      // completion instead of a jump-cut.
      let finished = false;
      function finishLoad(){
        if (finished) return;
        finished = true;
        clearInterval(tick);
        const rampStart = pct;
        const rampFrom = performance.now();
        const rampDuration = 220;
        function rampTick(now){
          const p = Math.min((now - rampFrom) / rampDuration, 1);
          setProgress(rampStart + (100 - rampStart) * p);
          if (p < 1) requestAnimationFrame(rampTick);
        }
        requestAnimationFrame(rampTick);
        setTimeout(() => {
          preloader.classList.add('pre-hidden');
          revealHeroLetters();
          setTimeout(() => preloader.remove(), 1100);
        }, rampDuration + 250);
      }
      // On mobile, wait less: phones on slower networks can take a while to
      // fire the full window "load" event (every image + video decoded),
      // and there's no reason to hold the visitor that long — the safety
      // net below now kicks in sooner on mobile too.
      const isMobilePreload = window.innerWidth <= 768;
      if (document.readyState === 'complete') setTimeout(finishLoad, 700);
      else window.addEventListener('load', () => setTimeout(finishLoad, 700));
      // Safety net: never let the preloader trap a visitor for too long —
      // shorter cap on mobile since slow asset loads there are common.
      setTimeout(finishLoad, isMobilePreload ? 2800 : 4000);
    }

    /* ---------- 2. CUSTOM CURSOR + AMBIENT GLOW (desktop only) ---------- */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const cursorGlow = document.getElementById('cursor-glow');

    if (canHover && !reduceMotion && cursorDot && cursorRing && cursorGlow) {
      document.documentElement.classList.add('has-custom-cursor');
      let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
      let ringX = mouseX, ringY = mouseY;
      let glowX = mouseX, glowY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
      });

      function cursorLoop(){
        requestAnimationFrame(cursorLoop);
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
        glowX += (mouseX - glowX) * 0.07;
        glowY += (mouseY - glowY) * 0.07;
        cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      }
      requestAnimationFrame(cursorLoop);

      document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .pro-glass-card, [data-cursor-hover]')) {
          cursorRing.classList.add('cursor-hover');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .pro-glass-card, [data-cursor-hover]')) {
          cursorRing.classList.remove('cursor-hover');
        }
      });
      document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0';
      });
      document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1'; cursorRing.style.opacity = '1';
      });
    } else {
      if (cursorDot) cursorDot.remove();
      if (cursorRing) cursorRing.remove();
      if (cursorGlow) cursorGlow.remove();
    }

    /* ---------- 3. MAGNETIC BUTTONS ---------- */
    if (canHover && !reduceMotion) {
      document.querySelectorAll('button, .magnetic').forEach((el) => {
        el.classList.add('magnetic');
        let mdx = 0, mdy = 0, mRaf = false;
        function applyMagnet() {
          mRaf = false;
          el.style.transform = `translate(${mdx.toFixed(1)}px, ${mdy.toFixed(1)}px)`;
        }
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          mdx = (e.clientX - (r.left + r.width / 2)) * 0.3;
          mdy = (e.clientY - (r.top + r.height / 2)) * 0.3;
          if (!mRaf) { mRaf = true; requestAnimationFrame(applyMagnet); }
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      });
    }

    /* ---------- 5. SCROLL WORD-REVEAL FOR SECTION HEADINGS ---------- */
    function splitWords(el){
      if (el.dataset.wordsSplit) return;
      el.dataset.wordsSplit = '1';
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.textContent = w;
        span.style.transitionDelay = (i * 0.05) + 's';
        el.appendChild(span);
        el.appendChild(document.createTextNode(' '));
      });
    }
    const headings = document.querySelectorAll('main h2, section h2');
    headings.forEach((h) => { h.classList.add('reveal-words'); splitWords(h); });

    if ('IntersectionObserver' in window) {
      const headingObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            headingObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      headings.forEach((h) => headingObserver.observe(h));
    } else {
      headings.forEach((h) => h.classList.add('in-view'));
    }

    /* ---------- 6. STAGGERED SCROLL REVEAL — every section, not just headings ---------- */
    (function(){
      const groupSelectors = [
        '#home .grid > div',
        '#products .grid.grid-cols-1.items-start > div',
        '#about .flex.flex-col.items-center.gap-12 > div',
        '#about .grid.grid-cols-2.gap-4 > div',
        '#culinary .grid > div',
        '#ceo .grid.grid-cols-3.gap-4 > div',
        '#vision .grid.grid-cols-1.gap-8 > div',
        '#vision-pillars .grid.grid-cols-1.gap-8 > div',
        '#certifications .grid.grid-cols-1.gap-5 > div',
        '#signature-film .grid.grid-cols-2.gap-5 > div',
        '#faq .flex.flex-col.gap-4 > details',
        '#contact .grid.grid-cols-1.gap-6 > div',
        'footer .grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div'
      ];
      const seenGroups = new Map();
      groupSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.dataset.revealApplied) return;
          el.dataset.revealApplied = '1';
          el.classList.add('reveal-up');
          const parent = el.parentElement;
          const count = seenGroups.get(parent) || 0;
          el.style.setProperty('--d', count % 8);
          seenGroups.set(parent, count + 1);
        });
      });

      const revealItems = document.querySelectorAll('.reveal-up');
      if (reduceMotion) {
        revealItems.forEach((el) => el.classList.add('in-view'));
      } else if ('IntersectionObserver' in window) {
        const itemObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              itemObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        revealItems.forEach((el) => itemObserver.observe(el));
      } else {
        revealItems.forEach((el) => el.classList.add('in-view'));
      }
    })();

    /* ---------- 6.4 "POP UP" ON SCROLL — every video/cover/description/
       info card lifts slightly as it enters view and settles back down
       the instant it leaves, every time, in both directions. ---------- */
    (function(){
      if (reduceMotion || !('IntersectionObserver' in window)) return;

      // .pro-glass-card already covers nearly every card that mixes a
      // video/image cover with a description or stat (product cards, the
      // CEO card, testimonial & contact cards, stat badges, etc). On top
      // of that, pick up any standalone video/image cover frame that
      // *isn't* already inside one of those cards (e.g. the About and
      // Signature Film section's big video frames), so nothing gets
      // lifted twice.
      const cardEls = Array.from(document.querySelectorAll('.pro-glass-card'));
      const looseCoverEls = Array.from(document.querySelectorAll(
        '.scroll-section [class*="aspect-video"], .scroll-section [class*="aspect-["]'
      )).filter(el => !el.closest('.pro-glass-card'));

      const popEls = [...cardEls, ...looseCoverEls];
      popEls.forEach(el => el.classList.add('pop-lift'));

      const popObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('lifted', entry.isIntersecting);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

      popEls.forEach(el => popObserver.observe(el));
    })();

    /* ---------- 6.45 FAN CAROUSEL — swipeable card slider used by the
       showcase-style sections. Whichever card sits nearest the track's
       center becomes the "active" (pink, full color) one; every other
       card stays grayscale. Works via native scroll + snap so it feels
       right on a touch screen, with arrow buttons and dots as an
       alternate way to move for mouse/keyboard users. ---------- */
    (function(){
      document.querySelectorAll('.fan-carousel').forEach((root) => {
        const track = root.querySelector('.fan-track');
        if (!track) return;
        const cards = Array.from(track.querySelectorAll('.fan-card'));
        const dotsWrap = root.querySelector('.fan-dots');
        const prevBtn = root.querySelector('.fan-prev');
        const nextBtn = root.querySelector('.fan-next');
        if (!cards.length) return;

        // Build dots
        let dots = [];
        if (dotsWrap) {
          dotsWrap.innerHTML = '';
          dots = cards.map((_, i) => {
            const d = document.createElement('span');
            d.className = 'fan-dot';
            d.addEventListener('click', () => scrollToCard(i));
            dotsWrap.appendChild(d);
            return d;
          });
        }

        function setActive(idx) {
          cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
          dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }

        function currentIndex() {
          const trackRect = track.getBoundingClientRect();
          const center = trackRect.left + trackRect.width / 2;
          let closest = 0, minDist = Infinity;
          cards.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const dist = Math.abs((r.left + r.width / 2) - center);
            if (dist < minDist) { minDist = dist; closest = i; }
          });
          return closest;
        }

        function scrollToCard(i) {
          const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
          if (!c) return;
          track.scrollTo({
            left: c.offsetLeft - (track.clientWidth - c.clientWidth) / 2,
            behavior: 'smooth'
          });
        }

        let raf = null;
        track.addEventListener('scroll', () => {
          if (raf) return;
          raf = requestAnimationFrame(() => {
            setActive(currentIndex());
            raf = null;
          });
        }, { passive: true });

        cards.forEach((c, i) => c.addEventListener('click', () => {
          if (!c.classList.contains('is-active')) scrollToCard(i);
        }));

        if (prevBtn) prevBtn.addEventListener('click', () => scrollToCard(currentIndex() - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => scrollToCard(currentIndex() + 1));

        // Start centered on the middle card
        requestAnimationFrame(() => {
          scrollToCard(Math.floor(cards.length / 2));
          setTimeout(() => setActive(currentIndex()), 350);
        });
      });
    })();

    /* ---------- 6.5 MOBILE: ONLY ANIMATE AURORA/SHIMMER WHEN ON SCREEN ----------
       Keeps the full original visual (same blobs, same shimmer, same
       motion) but only the ones currently near the viewport actually run —
       everything scrolled away just holds its last frame (paused, not
       hidden) until it scrolls back into view. This is what lets phones
       keep the exact desktop look without animating all ~99 of them at
       once. */
    (function(){
      const isMobileView = window.matchMedia('(max-width: 768px)').matches;
      const animEls = document.querySelectorAll('.aurora-blob, .gold-shimmer-text');
      if (!isMobileView || !animEls.length) return;
      if (!('IntersectionObserver' in window)) {
        animEls.forEach(el => el.classList.add('anim-active'));
        return;
      }
      const animObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('anim-active', entry.isIntersecting);
        });
      }, { rootMargin: '20% 0px 20% 0px', threshold: 0.01 });
      animEls.forEach(el => animObserver.observe(el));
    })();

    /* ---------- 7. NUMBER COUNT-UP ON SCROLL (hero + about + CEO stat badges) ----------
       Re-plays every time a number scrolls back into view, not just once, so
       revisiting a section (scrolling up/down past it) always re-triggers the
       count-up. A per-element run id cancels any in-flight animation if the
       number re-enters view again before the previous run finished. */
    (function(){
      const counters = document.querySelectorAll('[data-count-to]');
      if (!counters.length) return;

      const runIds = new WeakMap();

      function animateCounter(el){
        const myRun = (runIds.get(el) || 0) + 1;
        runIds.set(el, myRun);

        const target = parseFloat(el.getAttribute('data-count-to'));
        const suffix = el.getAttribute('data-count-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
        const duration = reduceMotion ? 0 : 1400;
        if (duration === 0) {
          el.textContent = target.toFixed(decimals) + suffix;
          return;
        }
        el.textContent = (0).toFixed(decimals) + suffix;
        const start = performance.now();
        function tick(now){
          if (runIds.get(el) !== myRun) return; // a newer run superseded this one
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = val.toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(tick);
      }

      if ('IntersectionObserver' in window) {
        const countObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) animateCounter(entry.target);
          });
        }, { threshold: 0.5 });
        counters.forEach((el) => countObserver.observe(el));
      } else {
        counters.forEach(animateCounter);
      }
    })();

  })();
  

/* ---- next inline block ---- */

window.CTA_FRAMES=["assets/images/reveal-seq/frame_001.webp", "assets/images/reveal-seq/frame_002.webp", "assets/images/reveal-seq/frame_003.webp", "assets/images/reveal-seq/frame_004.webp", "assets/images/reveal-seq/frame_005.webp", "assets/images/reveal-seq/frame_006.webp", "assets/images/reveal-seq/frame_007.webp", "assets/images/reveal-seq/frame_008.webp", "assets/images/reveal-seq/frame_009.webp", "assets/images/reveal-seq/frame_010.webp", "assets/images/reveal-seq/frame_011.webp", "assets/images/reveal-seq/frame_012.webp", "assets/images/reveal-seq/frame_013.webp", "assets/images/reveal-seq/frame_014.webp", "assets/images/reveal-seq/frame_015.webp", "assets/images/reveal-seq/frame_016.webp", "assets/images/reveal-seq/frame_017.webp", "assets/images/reveal-seq/frame_018.webp", "assets/images/reveal-seq/frame_019.webp", "assets/images/reveal-seq/frame_020.webp", "assets/images/reveal-seq/frame_021.webp", "assets/images/reveal-seq/frame_022.webp", "assets/images/reveal-seq/frame_023.webp", "assets/images/reveal-seq/frame_024.webp", "assets/images/reveal-seq/frame_025.webp", "assets/images/reveal-seq/frame_026.webp", "assets/images/reveal-seq/frame_027.webp", "assets/images/reveal-seq/frame_028.webp", "assets/images/reveal-seq/frame_029.webp", "assets/images/reveal-seq/frame_030.webp", "assets/images/reveal-seq/frame_031.webp", "assets/images/reveal-seq/frame_032.webp", "assets/images/reveal-seq/frame_033.webp", "assets/images/reveal-seq/frame_034.webp", "assets/images/reveal-seq/frame_035.webp", "assets/images/reveal-seq/frame_036.webp", "assets/images/reveal-seq/frame_037.webp", "assets/images/reveal-seq/frame_038.webp", "assets/images/reveal-seq/frame_039.webp", "assets/images/reveal-seq/frame_040.webp", "assets/images/reveal-seq/frame_041.webp", "assets/images/reveal-seq/frame_042.webp", "assets/images/reveal-seq/frame_043.webp", "assets/images/reveal-seq/frame_044.webp", "assets/images/reveal-seq/frame_045.webp", "assets/images/reveal-seq/frame_046.webp", "assets/images/reveal-seq/frame_047.webp", "assets/images/reveal-seq/frame_048.webp", "assets/images/reveal-seq/frame_049.webp", "assets/images/reveal-seq/frame_050.webp", "assets/images/reveal-seq/frame_051.webp", "assets/images/reveal-seq/frame_052.webp", "assets/images/reveal-seq/frame_053.webp", "assets/images/reveal-seq/frame_054.webp", "assets/images/reveal-seq/frame_055.webp", "assets/images/reveal-seq/frame_056.webp", "assets/images/reveal-seq/frame_057.webp", "assets/images/reveal-seq/frame_058.webp", "assets/images/reveal-seq/frame_059.webp", "assets/images/reveal-seq/frame_060.webp", "assets/images/reveal-seq/frame_061.webp", "assets/images/reveal-seq/frame_062.webp", "assets/images/reveal-seq/frame_063.webp", "assets/images/reveal-seq/frame_064.webp", "assets/images/reveal-seq/frame_065.webp", "assets/images/reveal-seq/frame_066.webp", "assets/images/reveal-seq/frame_067.webp", "assets/images/reveal-seq/frame_068.webp", "assets/images/reveal-seq/frame_069.webp", "assets/images/reveal-seq/frame_070.webp", "assets/images/reveal-seq/frame_071.webp", "assets/images/reveal-seq/frame_072.webp", "assets/images/reveal-seq/frame_073.webp", "assets/images/reveal-seq/frame_074.webp", "assets/images/reveal-seq/frame_075.webp", "assets/images/reveal-seq/frame_076.webp", "assets/images/reveal-seq/frame_077.webp", "assets/images/reveal-seq/frame_078.webp", "assets/images/reveal-seq/frame_079.webp", "assets/images/reveal-seq/frame_080.webp", "assets/images/reveal-seq/frame_081.webp", "assets/images/reveal-seq/frame_082.webp", "assets/images/reveal-seq/frame_083.webp", "assets/images/reveal-seq/frame_084.webp", "assets/images/reveal-seq/frame_085.webp", "assets/images/reveal-seq/frame_086.webp", "assets/images/reveal-seq/frame_087.webp", "assets/images/reveal-seq/frame_088.webp", "assets/images/reveal-seq/frame_089.webp", "assets/images/reveal-seq/frame_090.webp", "assets/images/reveal-seq/frame_091.webp", "assets/images/reveal-seq/frame_092.webp", "assets/images/reveal-seq/frame_093.webp", "assets/images/reveal-seq/frame_094.webp", "assets/images/reveal-seq/frame_095.webp", "assets/images/reveal-seq/frame_096.webp", "assets/images/reveal-seq/frame_097.webp", "assets/images/reveal-seq/frame_098.webp", "assets/images/reveal-seq/frame_099.webp", "assets/images/reveal-seq/frame_100.webp"];

/* ---- next inline block ---- */

window.MID_FRAMES=["assets/images/mid-seq/frame_001.webp", "assets/images/mid-seq/frame_002.webp", "assets/images/mid-seq/frame_003.webp", "assets/images/mid-seq/frame_004.webp", "assets/images/mid-seq/frame_005.webp", "assets/images/mid-seq/frame_006.webp", "assets/images/mid-seq/frame_007.webp", "assets/images/mid-seq/frame_008.webp", "assets/images/mid-seq/frame_009.webp", "assets/images/mid-seq/frame_010.webp", "assets/images/mid-seq/frame_011.webp", "assets/images/mid-seq/frame_012.webp", "assets/images/mid-seq/frame_013.webp", "assets/images/mid-seq/frame_014.webp", "assets/images/mid-seq/frame_015.webp", "assets/images/mid-seq/frame_016.webp", "assets/images/mid-seq/frame_017.webp", "assets/images/mid-seq/frame_018.webp", "assets/images/mid-seq/frame_019.webp", "assets/images/mid-seq/frame_020.webp", "assets/images/mid-seq/frame_021.webp", "assets/images/mid-seq/frame_022.webp", "assets/images/mid-seq/frame_023.webp", "assets/images/mid-seq/frame_024.webp", "assets/images/mid-seq/frame_025.webp", "assets/images/mid-seq/frame_026.webp", "assets/images/mid-seq/frame_027.webp", "assets/images/mid-seq/frame_028.webp", "assets/images/mid-seq/frame_029.webp", "assets/images/mid-seq/frame_030.webp", "assets/images/mid-seq/frame_031.webp", "assets/images/mid-seq/frame_032.webp", "assets/images/mid-seq/frame_033.webp", "assets/images/mid-seq/frame_034.webp", "assets/images/mid-seq/frame_035.webp", "assets/images/mid-seq/frame_036.webp", "assets/images/mid-seq/frame_037.webp", "assets/images/mid-seq/frame_038.webp", "assets/images/mid-seq/frame_039.webp", "assets/images/mid-seq/frame_040.webp", "assets/images/mid-seq/frame_041.webp", "assets/images/mid-seq/frame_042.webp", "assets/images/mid-seq/frame_043.webp", "assets/images/mid-seq/frame_044.webp", "assets/images/mid-seq/frame_045.webp", "assets/images/mid-seq/frame_046.webp", "assets/images/mid-seq/frame_047.webp", "assets/images/mid-seq/frame_048.webp", "assets/images/mid-seq/frame_049.webp", "assets/images/mid-seq/frame_050.webp", "assets/images/mid-seq/frame_051.webp", "assets/images/mid-seq/frame_052.webp", "assets/images/mid-seq/frame_053.webp", "assets/images/mid-seq/frame_054.webp", "assets/images/mid-seq/frame_055.webp", "assets/images/mid-seq/frame_056.webp", "assets/images/mid-seq/frame_057.webp", "assets/images/mid-seq/frame_058.webp", "assets/images/mid-seq/frame_059.webp", "assets/images/mid-seq/frame_060.webp", "assets/images/mid-seq/frame_061.webp", "assets/images/mid-seq/frame_062.webp", "assets/images/mid-seq/frame_063.webp", "assets/images/mid-seq/frame_064.webp", "assets/images/mid-seq/frame_065.webp", "assets/images/mid-seq/frame_066.webp", "assets/images/mid-seq/frame_067.webp", "assets/images/mid-seq/frame_068.webp", "assets/images/mid-seq/frame_069.webp", "assets/images/mid-seq/frame_070.webp", "assets/images/mid-seq/frame_071.webp", "assets/images/mid-seq/frame_072.webp", "assets/images/mid-seq/frame_073.webp", "assets/images/mid-seq/frame_074.webp", "assets/images/mid-seq/frame_075.webp", "assets/images/mid-seq/frame_076.webp", "assets/images/mid-seq/frame_077.webp", "assets/images/mid-seq/frame_078.webp", "assets/images/mid-seq/frame_079.webp", "assets/images/mid-seq/frame_080.webp", "assets/images/mid-seq/frame_081.webp", "assets/images/mid-seq/frame_082.webp"];
window.HERITAGE_FRAMES=["assets/images/heritage-seq/frame_001.webp", "assets/images/heritage-seq/frame_002.webp", "assets/images/heritage-seq/frame_003.webp", "assets/images/heritage-seq/frame_004.webp", "assets/images/heritage-seq/frame_005.webp", "assets/images/heritage-seq/frame_006.webp", "assets/images/heritage-seq/frame_007.webp", "assets/images/heritage-seq/frame_008.webp", "assets/images/heritage-seq/frame_009.webp", "assets/images/heritage-seq/frame_010.webp", "assets/images/heritage-seq/frame_011.webp", "assets/images/heritage-seq/frame_012.webp", "assets/images/heritage-seq/frame_013.webp", "assets/images/heritage-seq/frame_014.webp", "assets/images/heritage-seq/frame_015.webp", "assets/images/heritage-seq/frame_016.webp", "assets/images/heritage-seq/frame_017.webp", "assets/images/heritage-seq/frame_018.webp", "assets/images/heritage-seq/frame_019.webp", "assets/images/heritage-seq/frame_020.webp", "assets/images/heritage-seq/frame_021.webp", "assets/images/heritage-seq/frame_022.webp", "assets/images/heritage-seq/frame_023.webp", "assets/images/heritage-seq/frame_024.webp", "assets/images/heritage-seq/frame_025.webp", "assets/images/heritage-seq/frame_026.webp", "assets/images/heritage-seq/frame_027.webp", "assets/images/heritage-seq/frame_028.webp", "assets/images/heritage-seq/frame_029.webp", "assets/images/heritage-seq/frame_030.webp", "assets/images/heritage-seq/frame_031.webp", "assets/images/heritage-seq/frame_032.webp", "assets/images/heritage-seq/frame_033.webp", "assets/images/heritage-seq/frame_034.webp", "assets/images/heritage-seq/frame_035.webp", "assets/images/heritage-seq/frame_036.webp", "assets/images/heritage-seq/frame_037.webp", "assets/images/heritage-seq/frame_038.webp", "assets/images/heritage-seq/frame_039.webp", "assets/images/heritage-seq/frame_040.webp", "assets/images/heritage-seq/frame_041.webp", "assets/images/heritage-seq/frame_042.webp", "assets/images/heritage-seq/frame_043.webp", "assets/images/heritage-seq/frame_044.webp", "assets/images/heritage-seq/frame_045.webp", "assets/images/heritage-seq/frame_046.webp", "assets/images/heritage-seq/frame_047.webp", "assets/images/heritage-seq/frame_048.webp", "assets/images/heritage-seq/frame_049.webp", "assets/images/heritage-seq/frame_050.webp", "assets/images/heritage-seq/frame_051.webp", "assets/images/heritage-seq/frame_052.webp", "assets/images/heritage-seq/frame_053.webp", "assets/images/heritage-seq/frame_054.webp", "assets/images/heritage-seq/frame_055.webp", "assets/images/heritage-seq/frame_056.webp", "assets/images/heritage-seq/frame_057.webp", "assets/images/heritage-seq/frame_058.webp", "assets/images/heritage-seq/frame_059.webp", "assets/images/heritage-seq/frame_060.webp", "assets/images/heritage-seq/frame_061.webp", "assets/images/heritage-seq/frame_062.webp", "assets/images/heritage-seq/frame_063.webp", "assets/images/heritage-seq/frame_064.webp", "assets/images/heritage-seq/frame_065.webp", "assets/images/heritage-seq/frame_066.webp", "assets/images/heritage-seq/frame_067.webp", "assets/images/heritage-seq/frame_068.webp", "assets/images/heritage-seq/frame_069.webp", "assets/images/heritage-seq/frame_070.webp", "assets/images/heritage-seq/frame_071.webp", "assets/images/heritage-seq/frame_072.webp", "assets/images/heritage-seq/frame_073.webp", "assets/images/heritage-seq/frame_074.webp", "assets/images/heritage-seq/frame_075.webp", "assets/images/heritage-seq/frame_076.webp", "assets/images/heritage-seq/frame_077.webp", "assets/images/heritage-seq/frame_078.webp", "assets/images/heritage-seq/frame_079.webp", "assets/images/heritage-seq/frame_080.webp", "assets/images/heritage-seq/frame_081.webp", "assets/images/heritage-seq/frame_082.webp", "assets/images/heritage-seq/frame_083.webp", "assets/images/heritage-seq/frame_084.webp", "assets/images/heritage-seq/frame_085.webp", "assets/images/heritage-seq/frame_086.webp", "assets/images/heritage-seq/frame_087.webp", "assets/images/heritage-seq/frame_088.webp", "assets/images/heritage-seq/frame_089.webp", "assets/images/heritage-seq/frame_090.webp", "assets/images/heritage-seq/frame_091.webp", "assets/images/heritage-seq/frame_092.webp", "assets/images/heritage-seq/frame_093.webp", "assets/images/heritage-seq/frame_094.webp", "assets/images/heritage-seq/frame_095.webp", "assets/images/heritage-seq/frame_096.webp", "assets/images/heritage-seq/frame_097.webp", "assets/images/heritage-seq/frame_098.webp", "assets/images/heritage-seq/frame_099.webp", "assets/images/heritage-seq/frame_100.webp"];

/* ---- next inline block ---- */


  /* ---------- one-time device tier detection ----------
     Runs ONCE for the whole page (hero/mid/cta all read the result) instead
     of once per initFrameSeq() call, which used to spin up a throwaway
     WebGL context three times for the same answer.

     Why cores/RAM alone aren't enough: a lot of current mid-range Android
     silicon (e.g. octa-core big.LITTLE parts pairing 2x Cortex-A78 +
     6x Cortex-A55 with an Adreno 610/613/615-class GPU) reports 8 logical
     cores and often 6-8GB RAM, so the old `hardwareConcurrency <= 4 ||
     deviceMemory <= 4` check waved it through as "high end" — but the GPU
     is the actual bottleneck for a full-viewport canvas.drawImage() every
     rAF tick, not the CPU core count. We add a cheap, one-shot WebGL
     renderer-string sniff so this whole class of phone gets a middle tier:
     smoother than the true low-end path (no full imageSmoothing shutoff —
     that looks noticeably soft on a phone screen people hold close to
     their face) but lighter than desktop (DPR capped, cheaper resample). */
  window.__frameSeqTier = (function () {
    var ua = navigator.userAgent || '';
    var isMobileUA = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!isMobileUA) return 'high';

    var cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;
    var mem = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;

    // True low-end: few cores or little RAM, no ifs about it.
    if ((cores !== null && cores <= 4) || (mem !== null && mem <= 3)) return 'low';

    // GPU renderer sniff — Adreno 6xx below the ~620 mark (610/612/613/615/
    // 618/619 etc.) and Mali "-G5x"/"-T"-class parts are the common mid-tier
    // pairing for this CPU shape. One throwaway context, discarded immediately.
    var renderer = '';
    try {
      var probe = document.createElement('canvas');
      var gl = probe.getContext('webgl') || probe.getContext('experimental-webgl');
      if (gl) {
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) renderer = (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') + '';
      }
      if (gl) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); }
    } catch (e) {}

    var midAdreno = /Adreno.*\b(5\d\d|61[0-9]|62[0-9])\b/i.test(renderer);
    var midMali = /Mali-G5\d|Mali-T\d/i.test(renderer);
    if (midAdreno || midMali) return 'mid';

    // Any other mobile GPU we can't identify, or an unreadable/blocked
    // renderer string (common in locked-down WebViews): treat as mid
    // rather than assuming full desktop-class headroom, since erring
    // toward "high" is exactly the gap that let this class of device
    // slip through before.
    if (!renderer) return 'mid';

    return 'high';
  })();

  /* ---------- reusable scroll-scrubbed frame-sequence engine ----------
     Drives any sticky-canvas section: give it the section id, canvas id,
     frame list and native resolution and it handles cover-fit sizing
     (DPR capped to native asset res so frames are never upscale-stretched
     and stay crisp on desktop AND phone), scroll-linked scrubbing,
     progressive loading and content fade — exactly like the hero. */
  function initFrameSeq(opts) {
    'use strict';

    var section = document.getElementById(opts.sectionId);
    var canvas  = document.getElementById(opts.canvasId);
    var FRAMES  = opts.frames;
    if (!section || !canvas || !FRAMES || !FRAMES.length) return;

    var ctx = canvas.getContext('2d', { alpha: false });
    var content = opts.contentSelector ? section.querySelector(opts.contentSelector) : null;
    var cue = opts.cueId ? document.getElementById(opts.cueId) : null;
    var bar = opts.barSelector ? document.querySelector(opts.barSelector) : null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TOTAL = FRAMES.length;
    var images = new Array(TOTAL);
    var ready = new Array(TOTAL).fill(false);
    var readyCount = 0;

    /* ---------- canvas sizing (cover fit, DPR capped to native asset res) ----------
       Source stills are exported at a fixed native resolution. On any
       high-DPI screen (retina laptops, most phones) a naive
       `dpr = devicePixelRatio` makes the canvas backing store bigger than
       the source image, so the browser has to upscale-stretch it to fill
       — that stretch, not the source compression, is the biggest cause of
       a blurry/soft look. We cap dpr so the image is never asked to
       stretch past its native pixel count. */
    var cw = 0, ch = 0, dpr = 1;
    var NATIVE_W = opts.nativeW, NATIVE_H = opts.nativeH; // refined once frame 0 decodes

    /* ---------- device tier (see window.__frameSeqTier above) ----------
       'imageSmoothingQuality: high' does bicubic-style resampling on a
       full-viewport-sized image on every single scroll frame. On a strong
       CPU/GPU (most desktops/laptops) that's cheap enough to not matter.
       On a weak or mid-tier Android GPU it's the single biggest cause of
       frame-by-frame scroll jank. Three tiers instead of a binary switch:
         high — desktop / flagship phones: full DPR, bicubic resample
         mid  — common mid-range Android (this is the octa-core A78/A55 +
                Adreno 61x class): DPR capped tighter than desktop but not
                as hard as low-end, and a cheap 'low'-quality resample
                instead of shutting smoothing off entirely — turning it off
                completely reads as visibly soft on a phone held close to
                the face, so this trades a little GPU cost back for that.
         low  — few cores / little RAM: hardest DPR cap, smoothing off. */
    var tier = window.__frameSeqTier || 'high';

    function resize() {
      var r = canvas.getBoundingClientRect();
      cw = Math.max(1, Math.round(r.width));
      ch = Math.max(1, Math.round(r.height));
      var rawDpr = window.devicePixelRatio || 1;
      var coverScale = Math.max(cw / NATIVE_W, ch / NATIVE_H);
      var maxUsefulDpr = coverScale > 0 ? (1 / coverScale) : 3;
      // Tighter DPR cap the weaker the tier — fewer pixels for every
      // drawImage() call to push on every scroll-driven rAF tick.
      var dprCeiling = tier === 'low' ? 1.5 : tier === 'mid' ? 2 : 3;
      dpr = Math.max(1, Math.min(rawDpr, dprCeiling, maxUsefulDpr));
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      try {
        if (tier === 'low') {
          // Skip the expensive resample entirely on weak CPUs — a slightly
          // softer frame beats a stuttering one.
          ctx.imageSmoothingEnabled = false;
        } else if (tier === 'mid') {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
        } else {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
      } catch(e){}
      if (typeof updateFocusX === 'function') updateFocusX();
      lastDrawn = -1;
      draw(currentIndex());
    }

    // 0 = crop keeps the left edge of the source frame (subject-left
    // composition), 0.5 = centered (default, matches hero/reveal), 1 = keeps
    // the right edge. Only the horizontal axis is biased — vertical stays centered.
    //
    // FIX: a single fixed focusX (e.g. 0.2 for the mid/showcase sequence)
    // was tuned against a desktop-width canvas. On a phone the canvas is
    // much narrower relative to its height, so `cover` scaling has to
    // blow the source frame up far more horizontally just to fill the
    // height — that means a much bigger slice of the frame's width gets
    // cropped away. A left-biased focusX tuned for a mild desktop crop
    // becomes a severe crop on mobile and pushes the centered character
    // almost entirely out of the visible frame. opts.focusXMobile lets a
    // sequence specify a separate, more-centered bias for narrow
    // viewports; recomputed on resize/orientation change, not just once.
    var focusX = (typeof opts.focusX === 'number') ? opts.focusX : 0.5;
    var focusXDesktop = focusX;
    var focusXMobile = (typeof opts.focusXMobile === 'number') ? opts.focusXMobile : focusXDesktop;
    function updateFocusX() {
      focusX = (window.innerWidth <= 768) ? focusXMobile : focusXDesktop;
    }
    updateFocusX();

    function draw(i) {
      var img = images[i];
      if (!img || !ready[i] || !cw) return;
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;
      var scale = Math.max(cw / iw, ch / ih);
      var w = iw * scale, h = ih * scale;
      var offsetX = (cw - w) * focusX;
      ctx.drawImage(img, offsetX, (ch - h) / 2, w, h);
      lastDrawn = i;
    }

    /* ---------- nearest already-decoded frame (no blank flashes) ---------- */
    function resolve(i) {
      if (ready[i]) return i;
      for (var d = 1; d < TOTAL; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < TOTAL && ready[i + d]) return i + d;
      }
      return -1;
    }

    /* ---------- progress ---------- */
    var target = 0, smooth = 0, lastDrawn = -1, running = false;

    function computeTarget() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var span = section.offsetHeight - vh;
      if (span <= 0) return 0;
      var p = (-rect.top) / span;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }

    function currentIndex() {
      var i = Math.round(smooth * (TOTAL - 1));
      return i < 0 ? 0 : i > TOTAL - 1 ? TOTAL - 1 : i;
    }

    function tick() {
      var diff = target - smooth;
      if (Math.abs(diff) < 0.00025) { smooth = target; }
      // Lower factor = the frame catches up to the scroll position more
      // slowly, which reads as a weighted/"sticky" premium glide instead
      // of a snappy 1:1 follow. 0.18 felt fast/thin; 0.10 gives a heavier
      // settle without turning laggy or unresponsive.
      else { smooth += diff * (reduce ? 1 : 0.10); }

      var want = currentIndex();
      var use = resolve(want);
      if (use !== -1 && use !== lastDrawn) draw(use);

      if (bar) bar.style.transform = 'scaleX(' + smooth.toFixed(4) + ')';

      if (content) {
        var fade = smooth < 0.55 ? 1 : Math.max(0, 1 - (smooth - 0.55) / 0.3);
        content.style.opacity = fade.toFixed(3);
        content.style.transform = 'translate3d(0,' + (-smooth * 60).toFixed(2) + 'px,0)';
      }
      if (cue) cue.style.opacity = Math.max(0, 1 - smooth * 6).toFixed(3);

      if (smooth !== target) { requestAnimationFrame(tick); }
      else { running = false; }
    }

    function onScroll() {
      if (!inView) return; // off-screen sequences shouldn't compete for main-thread time while the user scrolls elsewhere
      target = computeTarget();
      if (!running) { running = true; requestAnimationFrame(tick); }
    }

    /* The page can scroll on <body> instead of the document (overflow-x
       tricks), and scroll events don't bubble from element scrollers — so
       instead of trusting scroll events alone we poll the section's own
       rect with rAF, but ONLY while it's on screen. Zero cost elsewhere. */
    var inView = true, polling = false;
    function poll() {
      if (!inView) { polling = false; return; }
      var t = computeTarget();
      if (t !== target) { target = t; }
      if (!running) { running = true; requestAnimationFrame(tick); }
      requestAnimationFrame(poll);
    }
    function startPoll() { if (!polling) { polling = true; requestAnimationFrame(poll); } }
    /* ---------- defer background frame downloads for below-the-fold
       sequences ----------
       Previously every initFrameSeq() call — hero, mid, AND contact —
       started downloading its full ~2-10MB frame set the instant frame 0
       decoded, regardless of scroll position. That meant ~15MB of webp
       frames (the contact sequence alone is ~9.7MB across 208 frames)
       were all competing for bandwidth with the hero on first paint, even
       though a visitor might not scroll anywhere near "showcase" or
       "reveal" for a while (or ever, on mobile). opts.deferLoad makes
       loadAll() wait for the SAME IntersectionObserver already watching
       this section (rootMargin 200px, so it still starts a little before
       the section is on screen) instead of firing unconditionally on
       page load. Hero keeps the old eager behavior since it's visible
       immediately. */
    var loadAllQueued = false, runLoadAll = null;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (inView) {
          startPoll();
          if (opts.deferLoad && !loadAllQueued && runLoadAll) { loadAllQueued = true; runLoadAll(); }
        }
      }, { rootMargin: '200px' }).observe(section);
    }
    startPoll();

    /* ---------- loading: first frame instantly, rest in the background ---------- */
    function load(i, cb) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        ready[i] = true; readyCount++;
        // redraw only when this newly decoded frame is closer to what we want
        var want = currentIndex();
        if (lastDrawn === -1 || Math.abs(i - want) < Math.abs(lastDrawn - want)) {
          draw(resolve(want));
        }
        cb && cb();
      };
      img.onerror = function () { cb && cb(); };
      img.src = FRAMES[i];
      images[i] = img;
    }

    function loadAll() {
      // 1) a coarse pass (every 8th frame) so scrubbing works almost immediately
      var coarse = [], i;
      for (i = 0; i < TOTAL; i += 8) coarse.push(i);
      var rest = [];
      for (i = 0; i < TOTAL; i++) if (coarse.indexOf(i) === -1) rest.push(i);
      var queue = coarse.concat(rest);
      var at = 0, CONC = 6;
      function next() {
        if (at >= queue.length) return;
        var idx = queue[at++];
        load(idx, next);
      }
      for (var k = 0; k < CONC; k++) next();
    }

    resize();
    load(0, function () {
      if (images[0] && images[0].naturalWidth) {
        var realW = images[0].naturalWidth, realH = images[0].naturalHeight;
        if (realW !== NATIVE_W || realH !== NATIVE_H) {
          NATIVE_W = realW; NATIVE_H = realH;
          resize();
        }
      }
      draw(0);
      if (opts.deferLoad) { runLoadAll = loadAll; if (inView) { loadAllQueued = true; loadAll(); } }
      else { loadAll(); }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      clearTimeout(resize._t);
      resize._t = setTimeout(function () { resize(); onScroll(); }, 120);
    }, { passive: true });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { resize(); onScroll(); }, 250);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) onScroll();
    });

    target = smooth = computeTarget();
    onScroll();
  }

  initFrameSeq({
    sectionId: 'reveal',
    canvasId: 'cta-frame-canvas',
    frames: window.CTA_FRAMES,
    contentSelector: '.cta-seq-content',
    cueId: 'cta-seq-cue',
    barSelector: '#cta-seq-progress i',
    nativeW: 720,
    nativeH: 1280,
    focusX: 0.5,
    focusXMobile: 0.5,
    deferLoad: true
  });

  initFrameSeq({
    sectionId: 'showcase',
    canvasId: 'mid-frame-canvas',
    frames: window.MID_FRAMES,
    contentSelector: '.mid-seq-content',
    cueId: 'mid-seq-cue',
    barSelector: '#mid-seq-progress i',
    nativeW: 720,
    nativeH: 1280,
    focusX: 0.5,
    focusXMobile: 0.5,
    deferLoad: true
  });

  initFrameSeq({
    sectionId: 'heritage',
    canvasId: 'heritage-frame-canvas',
    frames: window.HERITAGE_FRAMES,
    contentSelector: '.heritage-seq-content',
    cueId: 'heritage-seq-cue',
    barSelector: '#heritage-seq-progress i',
    nativeW: 720,
    nativeH: 1280,
    focusX: 0.5,
    focusXMobile: 0.5,
    deferLoad: true
  });

  /* ── Chef Video Smooth Scroll Scale Animation ── */
  (function() {
    var videoFrame = document.getElementById('chef-video-frame');
    if (!videoFrame) return;

    function onScrollVideo() {
      var rect = videoFrame.getBoundingClientRect();
      var winH = window.innerHeight;
      if (rect.top < winH && rect.bottom > 0) {
        var progress = (winH - rect.top) / (winH + rect.height);
        progress = Math.max(0, Math.min(1, progress));
        var scale = 0.93 + (progress * 0.12);
        var rotateX = (0.5 - progress) * 4;
        videoFrame.style.transform = 'scale(' + scale.toFixed(3) + ') rotateX(' + rotateX.toFixed(2) + 'deg)';
        videoFrame.style.boxShadow = '0 ' + (20 + progress * 20).toFixed(0) + 'px 70px rgba(168,67,46, ' + (0.2 + progress * 0.25).toFixed(2) + ')';
      }
    }

    window.addEventListener('scroll', onScrollVideo, { passive: true });
    onScrollVideo();
  })();

  /* ── 🎬 Dynamic Video Playback & Smooth Scroll Parallax Engine ── */
  (function() {
    function ensureVideoPlays(videoSelector) {
      var videos = document.querySelectorAll(videoSelector);
      videos.forEach(function(v) {
        v.muted = true;
        v.playsInline = true;
        var p = v.play();
        if (p && p.catch) {
          p.catch(function() {
            // Autoplay retry on user interaction
            document.addEventListener('click', function() { v.play(); }, { once: true });
            document.addEventListener('touchstart', function() { v.play(); }, { once: true });
          });
        }
      });
    }

    ensureVideoPlays('.chef-video-media');
  })();
  

/* ---- next inline block ---- */


(function () {
  'use strict';
  if (window.__premiumPolishInit) return;
  window.__premiumPolishInit = true;

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Tag targets for reveal --------------------------------------
  // Every direct section + hero-level block + card grid child.
  function tagTargets() {
    var picks = [];
    // Top-level sections and headers
    document.querySelectorAll('section, header, footer').forEach(function (s) {
      picks.push({ el: s, variant: '' });
    });
    // Common card containers inside sections
    document.querySelectorAll('section .grid, section .flex').forEach(function (g) {
      // Only stagger if it has 2+ visible children
      if (g.children && g.children.length >= 2) {
        g.classList.add('pp-stagger');
      }
    });
    // Big headings/paragraphs directly under sections
    var variants = ['', 'pp-left', 'pp-right', 'pp-zoom'];
    var i = 0;
    picks.forEach(function (p) {
      if (!p.el.classList.contains('pp-reveal') &&
          !p.el.classList.contains('pp-stagger')) {
        p.el.classList.add('pp-reveal');
        var v = variants[i % variants.length];
        if (v) p.el.classList.add(v);
        i++;
      }
    });
  }

  // ---- IntersectionObserver: replay on every enter/exit ------------
  function bindObserver() {
    if (reduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.pp-reveal, .pp-stagger')
        .forEach(function (el) { el.classList.add('pp-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.08) {
          e.target.classList.add('pp-in');
        } else if (e.intersectionRatio === 0) {
          // Reset when fully out so it re-plays next time
          e.target.classList.remove('pp-in');
        }
      });
    }, {
      threshold: [0, 0.08, 0.5, 1],
      rootMargin: '0px 0px -8% 0px'
    });
    document.querySelectorAll('.pp-reveal, .pp-stagger')
      .forEach(function (el) { io.observe(el); });
  }

  // ---- Scroll perf: pause decorative animations while scrolling ----
  var scrollTimer = null;
  function onScroll() {
    document.documentElement.classList.add('is-scrolling');
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      document.documentElement.classList.remove('is-scrolling');
    }, 140);
  }

  // ---- Boot --------------------------------------------------------
  function boot() {
    tagTargets();
    bindObserver();
    window.addEventListener('scroll', onScroll, { passive: true });
    // Rescan if the app injects new sections later
    var mo = new MutationObserver(function () {
      tagTargets();
      // Re-bind newly added nodes (cheap: reobserve set)
      bindObserver();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cards = Array.prototype.slice.call(document.querySelectorAll('#products .product-card-pro'));
  if (!cards.length) return;

  /* ---- cursor tilt + spotlight sheen (desktop only) ---- */
  if (canHover && !reduceMotion) {
    cards.forEach(function(card){
      var raf = false, rx = 0, ry = 0, mx = 50, my = 50;
      function apply(){
        raf = false;
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--mx', mx.toFixed(1) + '%');
        card.style.setProperty('--my', my.toFixed(1) + '%');
      }
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        rx = (px - 0.5) * 10;
        ry = (0.5 - py) * 8;
        mx = px * 100; my = py * 100;
        if (!raf) { raf = true; requestAnimationFrame(apply); }
      });
      card.addEventListener('mouseleave', function(){
        rx = 0; ry = 0; mx = 50; my = 50;
        requestAnimationFrame(apply);
      });
    });
  }

  /* Product cards' fly-in is now handled by the unified spiral-3D
     entrance system below (applies to every .pro-glass-card sitewide,
     including these), so no separate fly-in logic needed here. */
})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  /* ---------- PREMIUM FADE-UP BOX ENTRANCE (site-wide) ----------
     Every "box" on the page (.pro-glass-card — product cards, the CEO
     card, FAQ accordions, contact boxes, stat tiles, etc.) fades up
     gently EVERY time it scrolls into view (replays on every pass, not
     just the first), then settles back as you leave, ready to replay.
     Pure CSS class-toggle (.spiral-hidden) driven by IntersectionObserver
     — no inline transform is ever set, so it can't fight the page's own
     CSS rules (including the "transform:none !important" mobile overrides
     on product cards — see the matching !important rule in <head> that's
     specifically scoped to win there too, so this plays on phones).
     The #reviews ticker is excluded: its cards are already in
     constant motion (infinite marquee) and duplicated for the loop,
     so a scroll-triggered entrance there conflicted with the ticker and
     only ever showed one card. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.pro-glass-card'))
    .filter(function(box){ return !box.closest('#reviews'); });
  if (!boxes.length || reduceMotion || !('IntersectionObserver' in window)) return;

  // Stagger siblings that share a parent (grid cells, FAQ items...) so
  // a row/group spirals in as a cascade rather than all at once. Set
  // once, applies to every replay.
  var staggerIndex = new Map();
  boxes.forEach(function(box){
    var parent = box.parentElement;
    var n = staggerIndex.get(parent) || 0;
    staggerIndex.set(parent, n + 1);
    box.style.transitionDelay = Math.min(n * 0.1, 0.6) + 's';
    box.classList.add('spiral-hidden');
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      entry.target.classList.toggle('spiral-hidden', !entry.isIntersecting);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  boxes.forEach(function(box){ obs.observe(box); });
})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  var STORAGE_KEY = 'trc-sfx-enabled';
  var enabled = true;
  try { if (localStorage.getItem(STORAGE_KEY) === '0') enabled = false; } catch(e){}

  var ctx = null;
  function getCtx(){
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, vol, type, delay){
    if (!enabled) return;
    var c = getCtx();
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function hoverTick(){ tone(1200, 0.09, 0.03, 'sine'); }
  function clickChime(){ tone(720, 0.16, 0.045, 'triangle'); tone(1080, 0.18, 0.03, 'sine', 0.03); }

  document.addEventListener('click', function(){ getCtx(); }, { once: true, capture: true });

  /* iOS Safari quirk: :active (and other pseudo-classes triggered by
     touch) only fires reliably when *some* touchstart listener exists
     on document/body/html or the element itself — a window-level
     listener (like the pull-to-refresh one earlier in this file)
     doesn't count on several iOS Safari versions. Without this, the
     new .hero-cta-btn/.reserve-btn press-compress effect silently
     never shows up on iPhone even though it works everywhere else. */
  document.addEventListener('touchstart', function(){}, { passive: true });

  var TARGETS = 'button, .hero-cta-btn, .reserve-btn, nav a, #contact a, .faq-question, [role="button"]';
  document.addEventListener('mouseover', function(e){
    var el = e.target.closest ? e.target.closest(TARGETS) : null;
    if (el) hoverTick();
  });
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest(TARGETS) : null;
    if (el && el.id !== 'sfx-toggle') clickChime();
  });

  var toggle = document.createElement('button');
  toggle.id = 'sfx-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Toggle interface sound');
  toggle.textContent = enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
  toggle.addEventListener('click', function(ev){
    ev.stopPropagation();
    enabled = !enabled;
    toggle.textContent = enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch(e){}
    if (enabled) tone(900, 0.12, 0.04, 'sine');
  });
  function mountToggle(){ document.body.appendChild(toggle); }
  if (document.body) mountToggle();
  else document.addEventListener('DOMContentLoaded', mountToggle, { once: true });
})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawnRipple(x, y){
    var r = document.createElement('div');
    r.className = 'fx-ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    setTimeout(function(){ r.remove(); }, 650);
  }

  document.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'touch' || e.pointerType === 'pen') spawnRipple(e.clientX, e.clientY);
  }, { passive: true });

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return;

  /* Glowing comet trail following the cursor — desktop only. Separate
     from the existing #cursor-dot/#cursor-ring (kept untouched); this
     is a longer, fading tail behind it for extra motion cue. */
  var N = 7, dots = [], px = [], py = [];
  var wrap = document.createElement('div');
  wrap.id = 'cursor-comet';
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9996;';
  for (var i = 0; i < N; i++){
    var size = (7 - i * 0.7).toFixed(1);
    var s = document.createElement('span');
    s.style.cssText = 'position:absolute;top:0;left:0;width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
      'background:radial-gradient(circle, rgba(168,67,46,.9), rgba(192,138,82,.4) 60%, transparent 70%);' +
      'opacity:' + (1 - i / N * 0.85).toFixed(2) + ';transform:translate(-50%,-50%);will-change:transform;';
    wrap.appendChild(s);
    dots.push(s);
  }
  document.body.appendChild(wrap);
  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  for (i = 0; i < N; i++){ px.push(mx); py.push(my); }
  window.addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; }, { passive: true });
  (function tick(){
    var x = mx, y = my;
    for (var i = 0; i < N; i++){
      px[i] += (x - px[i]) * (0.35 - i * 0.025);
      py[i] += (y - py[i]) * (0.35 - i * 0.025);
      dots[i].style.transform = 'translate(' + px[i].toFixed(1) + 'px,' + py[i].toFixed(1) + 'px) translate(-50%,-50%)';
      x = px[i]; y = py[i];
    }
    requestAnimationFrame(tick);
  })();
})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  var bar = document.querySelector('#scroll-progress-bar i');
  if (!bar) return;
  var ticking = false;
  function update(){
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0;
    bar.style.width = (pct * 100).toFixed(2) + '%';
    ticking = false;
  }
  function onScroll(){
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  var STORAGE_KEY = 'redcocks_cart_v1';
  var cartReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toggleBtn = document.getElementById('cart-toggle-btn');
  var closeBtn = document.getElementById('cart-close-btn');
  var overlay = document.getElementById('cart-overlay');
  var drawer = document.getElementById('cart-drawer');
  var itemsList = document.getElementById('cart-items-list');
  var subtotalEl = document.getElementById('cart-subtotal-amount');
  var badge = document.getElementById('cart-count-badge');
  var toast = document.getElementById('cart-toast');
  var checkoutBtn = document.getElementById('cart-checkout-btn');
  if (!drawer) return;

  function loadCart(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  function saveCart(cart){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  var cart = loadCart();
  var toastTimer = null;

  function formatINR(n){
    return '₹' + n.toLocaleString('en-IN');
  }

  function updateBadge(){
    if (!badge) return;
    var count = cart.reduce(function(sum, it){ return sum + it.qty; }, 0);
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function render(){
    itemsList.innerHTML = '';
    var subtotal = 0;
    cart.forEach(function(item){
      subtotal += item.price * item.qty;
      var row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML =
        '<div class="cart-item-info">' +
          '<div class="cart-item-tag">' + item.tag + '</div>' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          '<div class="cart-item-price">' + formatINR(item.price * item.qty) + '</div>' +
        '</div>' +
        '<div class="cart-item-qty">' +
          '<button type="button" class="cart-qty-btn" data-action="dec" data-id="' + item.id + '" aria-label="Decrease quantity">−</button>' +
          '<span class="cart-qty-num">' + item.qty + '</span>' +
          '<button type="button" class="cart-qty-btn" data-action="inc" data-id="' + item.id + '" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<button type="button" class="cart-remove-btn" data-action="remove" data-id="' + item.id + '">Remove</button>';
      if (!cartReduceMotion) {
        row.classList.add('cart-row-enter');
        row.style.setProperty('--i', cart.indexOf(item));
      }
      itemsList.appendChild(row);
    });
    subtotalEl.textContent = formatINR(subtotal);
    drawer.classList.toggle('is-empty', cart.length === 0);
    updateBadge();
    if (!cartReduceMotion) {
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          itemsList.querySelectorAll('.cart-row-enter').forEach(function(el){
            el.classList.add('cart-row-in');
          });
        });
      });
    }
  }

  function findItem(id){
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i];
    return null;
  }

  function addToCart(data){
    var existing = findItem(data.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: data.id, name: data.name, price: data.price, tag: data.tag, qty: 1 });
    }
    saveCart(cart);
    render();
    showToast(data.name + ' added to cart');
  }

  function showToast(msg){
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('visible'); }, 2200);
  }

  function openDrawer(){
    drawer.classList.add('open');
    overlay.classList.add('visible');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Wire up every "Add to Cart" button on the page
  document.querySelectorAll('.cart-add-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation(); // don't trigger the parent fan-card's carousel-centering click
      addToCart({
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        price: parseFloat(btn.getAttribute('data-price')) || 0,
        tag: btn.getAttribute('data-tag') || ''
      });
      btn.classList.add('is-added');
      var original = btn.innerHTML;
      btn.innerHTML = 'Added ✓';
      setTimeout(function(){ btn.innerHTML = original; btn.classList.remove('is-added'); }, 1400);
    });
  });

  itemsList.addEventListener('click', function(e){
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    var id = actionBtn.getAttribute('data-id');
    var action = actionBtn.getAttribute('data-action');
    var item = findItem(id);
    if (!item) return;
    if (action === 'inc') item.qty += 1;
    if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
    if (action === 'remove') cart = cart.filter(function(it){ return it.id !== id; });
    saveCart(cart);
    render();
  });

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
  var emptyCta = document.getElementById('cart-empty-cta');
  if (emptyCta) emptyCta.addEventListener('click', closeDrawer);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(){
      if (!cart.length) return;
      var lines = cart.map(function(it){
        return '- ' + it.name + '  x' + it.qty + '  (' + formatINR(it.price * it.qty) + ')';
      });
      var subtotal = cart.reduce(function(sum, it){ return sum + it.price * it.qty; }, 0);
      var body = 'Hello The Red Cocks Concierge,\n\nI would like to reserve the following:\n\n' +
        lines.join('\n') + '\n\nSubtotal: ' + formatINR(subtotal) +
        '\n\nPlease confirm availability and delivery details.\n';
      var mailto = 'mailto:www.theredcocks@gmail.com' +
        '?subject=' + encodeURIComponent('Reserve Order — The Red Cocks') +
        '&body=' + encodeURIComponent(body);
      window.location.href = mailto;
    });
  }

  render();
})();


/* ---- next inline block ---- */


(function(){
  'use strict';

  var HERO_LOCK_MS = 9000; // hard, fixed lock — independent of video length/state

  var heroIframe = document.getElementById('hero-video-iframe-el');
  var chefVideo = document.getElementById('chef-video-el') || document.querySelector('.chef-video-media');
  var heroCueText = document.getElementById('hero-cue-text') || document.querySelector('#hero-seq-cue span');
  var chefBadgeText = document.getElementById('chef-badge-text') || document.querySelector('.chef-video-badge span:last-child');
  var soundBtn = document.getElementById('hero-sound-toggle');
  var soundIconOff = document.getElementById('hero-sound-icon-off');
  var soundIconOn = document.getElementById('hero-sound-icon-on');

  var heroUnlocked = false;
  var chefUnlocked = false;
  var chefTriggered = false;

  function lockBody() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function unlockBody() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  var heroCue = document.getElementById('hero-seq-cue');
  var heroProgressBar = document.querySelector('#hero-seq-progress i');

  // --- 1. HERO VIDEO: Cloudinary player embedded via iframe. Autoplay,
  // loop and mute are baked into the embed URL itself (so playback is
  // owned by the player, not fought over by our own play()/pause() calls).
  // The iframe has pointer-events:none (see CSS), so every tap, swipe or
  // scroll on the hero passes straight through to the page — the embedded
  // player never sees the touch, which is what fixes the video visibly
  // stuttering/pausing whenever someone touched the screen.
  var HERO_EMBED_BASE = 'https://player.cloudinary.com/embed/?cloud_name=dbpra7jk&public_id=5b39426f-48a1-4f92-b1dd-33c6db392575_1_mp5bhh&controls=false&autoplay=true&loop=true&playsinline=true&fluid=true&aspectRatio=9:16&cropMode=fill&bigPlayButton=false&showinfo=false';
  function heroEmbedSrc(muted) { return HERO_EMBED_BASE + '&muted=' + (muted ? 'true' : 'false'); }

  var heroCurrentlyMuted = true;
  var heroSoundWanted = false;

  // Fixes the visible flash/glitch at load time: the iframe stays
  // transparent (revealing the black background) until the Cloudinary
  // player has actually finished loading, then fades in smoothly.
  // Guarded with a fallback timer + immediate-check, because by the time
  // this script runs (it's loaded at the end of body) the iframe's own
  // 'load' event may already have fired — missing that event previously
  // left the video stuck at opacity:0 (black screen, no autoplay visible).
  if (heroIframe) {
    var heroRevealed = false;
    function revealHero() {
      if (heroRevealed) return;
      heroRevealed = true;
      heroIframe.classList.add('is-loaded');
    }
    heroIframe.addEventListener('load', revealHero);
    // Fallback: if load already fired before we attached the listener,
    // or never fires for some reason, reveal anyway after a short delay
    // so the video is never stuck hidden.
    setTimeout(revealHero, 600);
  }

  function setSoundIcon(isOn) {
    if (soundIconOff) soundIconOff.style.display = isOn ? 'none' : '';
    if (soundIconOn) soundIconOn.style.display = isOn ? '' : 'none';
    if (soundBtn) {
      soundBtn.classList.toggle('is-on', isOn);
      soundBtn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', isOn ? 'Mute video sound' : 'Turn on video sound');
    }
  }

  function setHeroMuted(muted) {
    if (!heroIframe) return;
    heroCurrentlyMuted = muted;
    // Swap src parameter so Cloudinary video actually plays its original sound track
    var newSrc = heroEmbedSrc(muted);
    if (heroIframe.src !== newSrc) {
      heroIframe.src = newSrc;
    }
    setSoundIcon(!muted);
  }

  if (soundBtn && heroIframe) {
    setSoundIcon(false);
    soundBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      heroSoundWanted = heroCurrentlyMuted; // about to flip, so "wanted" = the new state
      setHeroMuted(!heroCurrentlyMuted);
    });
  }

  // --- Hero sound follows viewport: the person's on/off choice ("wanted"
  // state) is remembered, but the video is force-muted the instant the
  // hero section leaves view, and un-muted again only if it was wanted
  // AND the section is back in view. This stops the original audio from
  // continuing to play once the person has scrolled to a later section. ---
  var heroSection = document.getElementById('home');
  if (heroIframe && heroSection && 'IntersectionObserver' in window) {
    var heroSoundObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          if (heroSoundWanted) setHeroMuted(false);
        } else {
          setHeroMuted(true);
        }
      });
    }, { threshold: 0.4 });
    heroSoundObserver.observe(heroSection);
  }

  // --- 2. HERO SCROLL LOCK: exactly 9 seconds, then instant release ---
  // Deliberately NOT tied to video duration/end/errors/stalls — those all
  // used to feed into the unlock condition and could delay or glitch it.
  // A flat timer guarantees a clean, predictable unlock every time.
  function unlockHero() {
    if (heroUnlocked) return;
    heroUnlocked = true;
    if (heroCueText) heroCueText.textContent = 'Scroll to Explore';
    if (heroCue) heroCue.style.opacity = '1';
    if (heroProgressBar) heroProgressBar.style.width = '100%';
    if (!chefTriggered || chefUnlocked) {
      unlockBody();
    }
  }

  if (heroIframe) {
    lockBody();
    var heroLockStart = Date.now();
    (function tickHeroProgress(){
      var elapsed = Date.now() - heroLockStart;
      var pct = Math.min(100, (elapsed / HERO_LOCK_MS) * 100);
      if (heroProgressBar) heroProgressBar.style.width = pct + '%';
      if (!heroUnlocked && elapsed < HERO_LOCK_MS) {
        requestAnimationFrame(tickHeroProgress);
      }
    })();
    setTimeout(unlockHero, HERO_LOCK_MS);
  } else {
    heroUnlocked = true;
  }

  // --- 2. CHEF VIDEO LOCK LOGIC (Minimum 6 Seconds Lock) ---
  var chefMinTimePassed = false;
  var chefVideoEnded = false;

  function tryUnlockChef() {
    if (chefMinTimePassed && chefVideoEnded) {
      unlockChef();
    }
  }

  function unlockChef() {
    if (chefUnlocked) return;
    chefUnlocked = true;
    if (chefVideo) {
      chefVideo.loop = true;
      chefVideo.play().catch(function(){});
    }
    if (chefBadgeText) chefBadgeText.textContent = 'LIVE CHEF PREPARATION · MASTER SERIES';
    unlockBody();
  }

  if (chefVideo) {
    chefVideo.addEventListener('ended', function(){
      chefVideoEnded = true;
      tryUnlockChef();
    });
    chefVideo.addEventListener('timeupdate', function(){
      if (chefVideo.duration && chefVideo.currentTime >= chefVideo.duration - 0.25) {
        chefVideoEnded = true;
        tryUnlockChef();
      }
    });
    chefVideo.addEventListener('error', function(){
      chefVideoEnded = true;
      chefMinTimePassed = true;
      unlockChef();
    });
  } else {
    chefUnlocked = true;
  }

  // --- 3. PREVENT SCROLL WHEN LOCKED ---
  function preventIfLocked(e) {
    var isHeroActive = !heroUnlocked;
    var isChefActive = chefTriggered && !chefUnlocked;
    if (isHeroActive || isChefActive) {
      e.preventDefault();
      return false;
    }
  }

  function handleKey(e) {
    var isHeroActive = !heroUnlocked;
    var isChefActive = chefTriggered && !chefUnlocked;
    if (isHeroActive || isChefActive) {
      var keys = ['ArrowDown', 'PageDown', 'Space', ' ', 'Down', 'ArrowUp', 'PageUp', 'Up'];
      if (keys.indexOf(e.key) !== -1 || keys.indexOf(e.code) !== -1) {
        e.preventDefault();
        return false;
      }
    }
  }

  window.addEventListener('wheel', preventIfLocked, { passive: false });
  window.addEventListener('touchmove', preventIfLocked, { passive: false });
  window.addEventListener('keydown', handleKey, { passive: false });

  // --- 4. OBSERVE CHEF VIDEO FRAME (Triggers only when video frame is fully visible) ---
  if ('IntersectionObserver' in window) {
    var chefObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting && !chefTriggered && !chefUnlocked && heroUnlocked) {
          chefTriggered = true;

          // Smoothly align the video frame into center of screen
          entry.target.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Lock scroll on the video frame
          setTimeout(function() {
            lockBody();
          }, 250);

          if (chefVideo) {
            try {
              chefVideo.currentTime = 0;
              chefVideo.play().catch(function(){});
            } catch(e){}
          }
          if (chefBadgeText) chefBadgeText.textContent = 'LIVE CHEF PREPARATION · MASTER SERIES (Playing...)';

          // Lock for at least 6 seconds
          setTimeout(function(){
            chefMinTimePassed = true;
            tryUnlockChef();
          }, 6000);

          // Safety fallback (max 14 seconds)
          var videoDur = (chefVideo && chefVideo.duration && !isNaN(chefVideo.duration)) ? chefVideo.duration : 12;
          var maxSafetySec = Math.max(6, videoDur + 1);
          setTimeout(function(){
            chefMinTimePassed = true;
            chefVideoEnded = true;
            unlockChef();
          }, maxSafetySec * 1000);
        }
      });
    }, { threshold: 0.7 });

    var chefFrameEl = document.getElementById('chef-video-frame') || document.querySelector('.chef-video-card-wrapper');
    if (chefFrameEl) chefObs.observe(chefFrameEl);
  }

})();


/* ---- next inline block ---- */


(function(){
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 1. Tag all cards, grids, sections with spatial reveal system
  function initSpatialTargets() {
    var cards = document.querySelectorAll('.pro-glass-card, .fan-card, .chef-video-card-wrapper, .ceo-photocard, section .grid > div');
    cards.forEach(function(el){
      if (!el.classList.contains('fable-spatial-target')) {
        el.classList.add('fable-spatial-target');
        el.classList.add('fable-spatial-hidden');
      }
    });

    var grids = document.querySelectorAll('section .grid, .fan-track');
    grids.forEach(function(g){
      g.classList.add('fable-stagger');
    });
  }

  // 2. IntersectionObserver for 3D Spatial Entrance
  function bindSpatialObserver() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.remove('fable-spatial-hidden');
          entry.target.classList.add('fable-spatial-in');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fable-spatial-target').forEach(function(el){
      obs.observe(el);
    });
  }

  // 3. Interactive 3D Touch & Gyro Tilt Effect for Cards (Desktop mouse only to keep Mobile Android 60FPS)
  function bind3DTilt() {
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return; // Skip 3D card tilt on touch screens to guarantee butter-smooth Android scrolling

    var cards = document.querySelectorAll('.pro-glass-card, .ceo-photocard');
    cards.forEach(function(card){
      if (card.closest('#ceo')) return;
      var raf = null;
      function onMove(e) {
        var rect = card.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        var x = (clientX - rect.left) / rect.width;
        var y = (clientY - rect.top) / rect.height;
        var rx = (0.5 - y) * 12;
        var ry = (x - 0.5) * 12;
        if (!raf) {
          raf = requestAnimationFrame(function(){
            card.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)';
            raf = null;
          });
        }
      }
      function onLeave() {
        card.style.transform = '';
      }
      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseleave', onLeave, { passive: true });
    });
  }

  function boot() {
    initSpatialTargets();
    bindSpatialObserver();
    bind3DTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();


/* ---- next inline block ---- */


  /* ===========================================================================
     LUXURY 3D BRANCH TREE — ambient background object, desktop/tablet only.
     Procedurally grown branch structure in crimson→rose-gold, sitting behind
     all content. Rotates gently on its own, tilts toward the mouse (parallax),
     and turns further as you scroll — pure decoration, zero interaction cost,
     and skipped entirely on phones to protect performance on low-end devices.
     =========================================================================== */
  (function () {
    if (typeof THREE === 'undefined') return; // CDN blocked / offline — fail silently
    if (window.innerWidth <= 768) return; // keep phones on the lightweight CSS-only background
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('lux-tree-canvas');
    if (!canvas) return;

    let width = window.innerWidth, height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 9);

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // ---- procedural branch generator ------------------------------------
    // Builds a set of line segments recursively, each generation thinner,
    // shorter, and shifted toward gold, giving a coral/antler-like silhouette.
    const positions = [];
    const colors = [];
    const colorTrunk = new THREE.Color('#35180F');
    const colorMid = new THREE.Color('#A8432E');
    const colorTip = new THREE.Color('#C08A52');

    function branch(origin, dir, len, depth, maxDepth) {
      const end = origin.clone().add(dir.clone().multiplyScalar(len));
      const t = depth / maxDepth;
      const col = t < 0.5
        ? colorTrunk.clone().lerp(colorMid, t * 2)
        : colorMid.clone().lerp(colorTip, (t - 0.5) * 2);

      positions.push(origin.x, origin.y, origin.z, end.x, end.y, end.z);
      colors.push(col.r, col.g, col.b, col.r, col.g, col.b);

      if (depth >= maxDepth) return;

      const children = depth === 0 ? 4 : (Math.random() < 0.75 ? 2 : 3);
      for (let i = 0; i < children; i++) {
        const spread = 0.55 + Math.random() * 0.5;
        const axis = new THREE.Vector3(
          (Math.random() - 0.5),
          (Math.random() - 0.5),
          (Math.random() - 0.5)
        ).normalize();
        const newDir = dir.clone()
          .applyAxisAngle(axis, spread)
          .normalize()
          .lerp(new THREE.Vector3(0, 1, 0), 0.12) // gentle upward bias, feels alive
          .normalize();
        branch(end, newDir, len * (0.68 + Math.random() * 0.1), depth + 1, maxDepth);
      }
    }

    // Grow two clusters so the canopy reads as a full ambient backdrop rather
    // than a single centered plant.
    branch(new THREE.Vector3(-2.6, -3.2, -2), new THREE.Vector3(0.15, 1, -0.1).normalize(), 1.7, 0, 6);
    branch(new THREE.Vector3(2.8, -3.4, -3), new THREE.Vector3(-0.1, 1, 0.1).normalize(), 1.6, 0, 6);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const lines = new THREE.LineSegments(geometry, material);
    treeGroup.add(lines);
    treeGroup.scale.setScalar(1.9);
    treeGroup.position.set(0, 0.6, 0);

    // ---- interaction: mouse parallax + scroll-linked rotation -----------
    let targetRotX = 0, targetRotY = 0;
    let mouseRotX = 0, mouseRotY = 0;

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = nx * 0.35;
      targetRotX = ny * 0.18;
    }, { passive: true });

    let scrollRot = 0;
    window.addEventListener('scroll', () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) : 0;
      scrollRot = progress * Math.PI * 0.9; // slow full-page-scroll turn
    }, { passive: true });

    window.addEventListener('resize', () => {
      width = window.innerWidth; height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    let idle = 0;
    function animate() {
      requestAnimationFrame(animate);
      idle += 0.0015;

      // smooth-follow the mouse target (eases rather than snapping)
      mouseRotX += (targetRotX - mouseRotX) * 0.04;
      mouseRotY += (targetRotY - mouseRotY) * 0.04;

      treeGroup.rotation.x = mouseRotX + Math.sin(idle * 0.6) * 0.05;
      treeGroup.rotation.y = mouseRotY + scrollRot + idle;

      renderer.render(scene, camera);
    }
    animate();
  })();

/* ============================================================
   REDBOT — REAL AI
   ============================================================ */
(function () {
  'use strict';

  const launcher = document.getElementById('redbot-launcher');
  const panel = document.getElementById('redbot-panel');
  const closeBtn = document.getElementById('redbot-close-btn');
  const messages = document.getElementById('redbot-messages');
  const form = document.getElementById('redbot-form');
  const input = document.getElementById('redbot-input');

  if (!launcher || !panel || !form || !input) return;

  const AI_ENDPOINT = 'https://theredcocksv3.vercel.app/api/chat';

  let conversation = [];

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = 'redbot-msg ' + type;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'redbot-msg bot';
    typing.id = 'redbot-typing';
    typing.textContent = 'Typing...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    showTyping();

    conversation.push({
      role: 'user',
      content: text
    });

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversation.slice(-10)
        })
      });

      const data = await response.json();

      const typing = document.getElementById('redbot-typing');
      if (typing) typing.remove();

      if (!response.ok) {
        throw new Error(data.error || 'AI request failed');
      }

      const reply = data.reply || 'Sorry, I could not answer that.';

      addMessage(reply, 'bot');

      conversation.push({
        role: 'assistant',
        content: reply
      });

    } catch (error) {
      console.error(error);

      const typing = document.getElementById('redbot-typing');
      if (typing) typing.remove();

      addMessage(
        'Sorry, AI se connection mein problem aa rahi hai. Thodi der baad try karo.',
        'bot'
      );
    }
  }

  launcher.addEventListener('click', function () {
    panel.classList.toggle('open');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      panel.classList.remove('open');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage(input.value);
  });

})();
