(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle (remembers choice, falls back to system preference) */
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (!saved && window.matchMedia('(prefers-color-scheme: light)').matches) saved = 'light';
  if (saved) root.setAttribute('data-theme', saved);
  document.getElementById('theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* Typing effect */
  var roles = [
    'Senior Frontend Developer',
    'UX/UI Designer',
    'AI & Prompt Engineering Specialist',
    'Structural Engineer & Fabricator'
  ];
  var el = document.getElementById('typed');
  if (reduce) {
    el.textContent = roles.join(' · ');
  } else {
    var r = 0, c = 0, del = false;
    (function tick() {
      var word = roles[r];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      var wait = del ? 35 : 75;
      if (!del && c === word.length) { del = true; wait = 1600; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  }

  /* Particle grid background */
  var cv = document.getElementById('field');
  var ctx = cv.getContext('2d');
  var pts = [], W, H, mouse = { x: -999, y: -999 };
  function size() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    var n = Math.min(70, Math.floor(W / 20));
    pts = [];
    for (var i = 0; i < n; i++) {
      pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 });
    }
  }
  function colors() {
    var s = getComputedStyle(root);
    return { gold: s.getPropertyValue('--gold').trim(), cyan: s.getPropertyValue('--cyan').trim() };
  }
  function draw(still) {
    var col = colors();
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = col.gold;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.283); ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 14000) {
          ctx.globalAlpha = (1 - d / 14000) * 0.35;
          ctx.strokeStyle = col.cyan;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      var mx = p.x - mouse.x, my = p.y - mouse.y;
      if (mx * mx + my * my < 20000) {
        ctx.globalAlpha = 0.5; ctx.strokeStyle = col.gold;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!still) requestAnimationFrame(function () { draw(false); });
  }
  size();
  draw(reduce);
  window.addEventListener('resize', function () { size(); if (reduce) draw(true); });
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });

  /* Skill bars fill when scrolled into view */
  var lists = document.querySelectorAll('.bars');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    lists.forEach(function (l) { io.observe(l); });
  } else {
    lists.forEach(function (l) { l.classList.add('in'); });
  }

  /* Contact form: sends to Formspree, shows result */
  var form = document.getElementById('form');
  var status = document.getElementById('status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (res.ok) { form.reset(); status.textContent = 'Message sent. I will reply soon.'; }
        else { status.textContent = 'Could not send. Email me directly at danielegemasi@gmail.com.'; }
      })
      .catch(function () { status.textContent = 'Network error. Email me directly at danielegemasi@gmail.com.'; });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
