/* ================================================================
   NANAN SOMANAN — Portfolio JS
================================================================ */

/* ── Custom Cursor (desktop only) ─────────────────────────── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

if (dot && ring) {
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    // Dot follows instantly
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';

    // Ring lags slightly via lerp in rAF
    ringX += (e.clientX - ringX) * 0.18;
    ringY += (e.clientY - ringY) * 0.18;
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, [onclick], .exp-card, .service-card, .step-panel, .cert-item, .filter-btn')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

/* ── Scroll events ─────────────────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');
const backTop     = document.getElementById('back-top');
const navbar      = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total    = document.documentElement.scrollHeight - window.innerHeight;

  if (progressBar) progressBar.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
  if (backTop)     backTop.classList.toggle('visible', scrolled > 450);
  if (navbar)      navbar.classList.toggle('scrolled', scrolled > 70);
}, { passive: true });

/* ── Back to top ───────────────────────────────────────────── */
if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Mobile nav ────────────────────────────────────────────── */
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const hbg = document.getElementById('hamburger');
  const ovl = document.getElementById('overlay');
  if (!nav) return;
  const isOpen = nav.classList.toggle('open');
  hbg.classList.toggle('open', isOpen);
  ovl.classList.toggle('visible', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const hbg = document.getElementById('hamburger');
  const ovl = document.getElementById('overlay');
  if (!nav) return;
  nav.classList.remove('open');
  hbg.classList.remove('open');
  ovl.classList.remove('visible');
  document.body.style.overflow = '';
}

// Close on overlay click
const overlay = document.getElementById('overlay');
if (overlay) overlay.addEventListener('click', closeMobileNav);

/* ── Strategy accordion ────────────────────────────────────── */
function toggleStep(panel) {
  const body   = panel.querySelector('.step-body');
  const isOpen = body.classList.contains('open');

  // Close all others
  document.querySelectorAll('.step-panel').forEach(p => {
    p.classList.remove('active');
    p.querySelector('.step-body').classList.remove('open');
  });

  // Toggle clicked
  if (!isOpen) {
    body.classList.add('open');
    panel.classList.add('active');
  }
}

/* ── Experience filter ─────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.exp-card').forEach(card => {
      const match = filter === 'all' || card.dataset.industry === filter;
      card.style.display = match ? '' : 'none';
    });
  });
});

/* ── Scroll reveal ─────────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Hero reveals on load ──────────────────────────────────── */
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 100 + 80);
  });
});
