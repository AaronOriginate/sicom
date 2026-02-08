/* ═══════════════════════════════════════════════════════════
   SICOM POC — Shared JavaScript
   ═══════════════════════════════════════════════════════════ */

// ═══ SCROLL REVEAL ═══
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ═══ NAV SCROLL ═══
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ═══ HAMBURGER ═══
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
}

function closeMobile() {
  if (hamburger && mobileMenu) {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ═══ SMOOTH SCROLL ═══
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      closeMobile();
      const offset = 80;
      const pos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  });
});

// ═══ FAQ ACCORDION ═══
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-a').style.maxHeight = '0';
    });

    // Open clicked (if wasn't open)
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ═══ CURSOR RING ═══
const glow = document.getElementById('cursorGlow');
if (glow) {
  let active = false;
  document.addEventListener('mousemove', (e) => {
    if (!active) { glow.classList.add('active'); active = true; }
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    const target = e.target.closest('a, button, [role="button"], input, textarea, select, .faq-q');
    if (target) {
      glow.classList.add('hovering');
    } else {
      glow.classList.remove('hovering');
    }
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    glow.classList.remove('active', 'hovering');
    active = false;
  });
}

// ═══ COUNT-UP ANIMATION ═══
function animateCountUp(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCountUp(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-countup]').forEach(el => countObserver.observe(el));

// ═══ DATA STREAM CANVAS ═══
const dataCanvas = document.getElementById('dataStream');
if (dataCanvas) {
  const ctx = dataCanvas.getContext('2d');
  let cols, drops, active, speed;
  const chars = '01001101011010010110';
  const fontSize = 12;
  const colSpacing = 24;
  const activeRatio = 0.2;
  const fallSpeed = 2.5; // pixels per frame — fast

  function initStream() {
    dataCanvas.width = dataCanvas.offsetWidth;
    dataCanvas.height = dataCanvas.offsetHeight;
    cols = Math.floor(dataCanvas.width / colSpacing);
    drops = new Float32Array(cols);
    active = new Uint8Array(cols);
    speed = new Float32Array(cols);
    for (let i = 0; i < cols; i++) {
      active[i] = Math.random() < activeRatio ? 1 : 0;
      drops[i] = Math.random() * dataCanvas.height;
      speed[i] = fallSpeed + Math.random() * 1.5;
    }
  }

  function drawStream() {
    // Clear fully each frame — no banding from partial fade
    ctx.clearRect(0, 0, dataCanvas.width, dataCanvas.height);
    ctx.font = fontSize + 'px JetBrains Mono, monospace';

    for (let i = 0; i < cols; i++) {
      if (!active[i]) continue;

      const x = i * colSpacing;
      const headY = drops[i];
      const trailLen = 8;

      // Draw trail of characters fading upward from head
      for (let t = 0; t < trailLen; t++) {
        const y = headY - t * fontSize;
        if (y < -fontSize || y > dataCanvas.height + fontSize) continue;

        const fade = 1 - (t / trailLen);
        const alpha = fade * 0.7;

        if (t === 0) {
          // Head character — intense glow
          ctx.shadowColor = 'rgba(100, 255, 230, 1)';
          ctx.shadowBlur = 40;
          ctx.fillStyle = `rgba(200, 255, 245, 1)`;
        } else if (t <= 2) {
          ctx.shadowColor = 'rgba(28, 220, 190, 0.9)';
          ctx.shadowBlur = 28;
          ctx.fillStyle = `rgba(120, 255, 235, ${alpha + 0.2})`;
        } else {
          ctx.shadowColor = 'rgba(28, 200, 176, 0.5)';
          ctx.shadowBlur = 16;
          ctx.fillStyle = `rgba(60, 220, 200, ${alpha * 0.8})`;
        }

        const charIdx = (i * 7 + t * 3 + Math.floor(headY / fontSize)) % chars.length;
        ctx.fillText(chars[charIdx], x, y);
      }

      // Advance position smoothly
      drops[i] += speed[i];

      // Recycle when trail is fully off-screen
      if (drops[i] - trailLen * fontSize > dataCanvas.height) {
        active[i] = 0;
        drops[i] = -fontSize;
        // Activate a random column
        const newCol = Math.floor(Math.random() * cols);
        active[newCol] = 1;
        drops[newCol] = -fontSize;
        speed[newCol] = fallSpeed + Math.random() * 1.5;
      }
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    requestAnimationFrame(drawStream);
  }

  initStream();
  drawStream();
  window.addEventListener('resize', initStream);
}

// ═══ ACTIVE NAV LINK ═══
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
    link.classList.add('active');
  }
});
