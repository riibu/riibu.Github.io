(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = (fn) => { try { return fn(); } catch (e) { return null; } };

  /* ---------- Phosphor theme toggle ---------- */
  const themeBtn = document.getElementById('theme');
  const setTheme = (t) => {
    t === 'green' ? root.setAttribute('data-phosphor', 'green') : root.removeAttribute('data-phosphor');
    themeBtn.textContent = 'phosphor: ' + t;
    safe(() => localStorage.setItem('phosphor', t));
  };
  setTheme(safe(() => localStorage.getItem('phosphor')) === 'green' ? 'green' : 'amber');
  themeBtn.addEventListener('click', () => {
    setTheme(root.hasAttribute('data-phosphor') ? 'amber' : 'green');
    drawColor = getComputedStyle(root).getPropertyValue('--fg').trim();
  });

  /* ---------- Typewriter roles ---------- */
  const roles = [
    'NQF Level 5 Cybersecurity Analyst',
    'Network Defence & Hardening',
    'Pentesting Lab Builder',
    'CCNA + Network+ in progress'
  ];
  const typed = document.getElementById('typed');
  if (reduced) {
    typed.textContent = roles[0];
  } else {
    let r = 0, c = 0, del = false;
    const tick = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1800); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 25 : 60);
    };
    tick();
  }

  /* ---------- Falling-character background ---------- */
  const canvas = document.getElementById('rain');
  const ctx = canvas.getContext('2d');
  let drawColor = getComputedStyle(root).getPropertyValue('--fg').trim();
  const glyphs = '01<>/\\{}[]#$%&*+=ABCDEF';
  let cols, drops, size = 16;
  const resize = () => {
    canvas.width = innerWidth; canvas.height = innerHeight;
    cols = Math.ceil(canvas.width / size);
    drops = Array.from({ length: cols }, () => Math.random() * canvas.height / size);
  };
  resize();
  addEventListener('resize', resize);
  const rain = () => {
    ctx.fillStyle = 'rgba(20,16,31,.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = drawColor;
    ctx.font = size + 'px VT323, monospace';
    drops.forEach((y, i) => {
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
      drops[i] = y * size > canvas.height && Math.random() > .975 ? 0 : y + 1;
    });
  };
  if (reduced) { canvas.style.display = 'none'; }
  else { setInterval(() => { if (!document.hidden) rain(); }, 70); }

  /* ---------- Scroll reveal ---------- */
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Interactive terminal ---------- */
  const out = document.getElementById('out');
  const form = document.getElementById('cmd');
  const input = document.getElementById('in');
  const history = []; let hi = 0;

  const commands = {
    help:     'Commands: whoami, skills, certs, projects, contact, theme, clear',
    whoami:   'Siyethaba Sokhela - NQF Level 5 Cybersecurity Analyst focused on network defence, security diagnostics and system hardening.',
    skills:   'Network Security | Routing & Switching | Firewall Configuration | Vulnerability Assessment | Packet Analysis | Linux Administration | TCP/IP Protocols | Access Control (RBAC)',
    certs:    '[done] NQF Level 5 Cybersecurity Analyst\n[wip]  Cisco CCNA\n[wip]  CompTIA Network+',
    projects: '1. Isolated Pentesting & Vulnerability Lab\n2. Network Infrastructure & Hardware Deployment',
    contact:  'email: your.email@example.com\ngithub: github.com\nlinkedin: linkedin.com'
  };

  const print = (text, cls) => {
    const p = document.createElement('div');
    if (cls) p.className = cls;
    p.textContent = text;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print('$ ' + raw, 'you');
    history.push(raw); hi = history.length;
    if (cmd === 'clear') { out.textContent = ''; }
    else if (cmd === 'theme') { themeBtn.click(); print('phosphor switched.'); }
    else if (commands[cmd]) { print(commands[cmd]); }
    else { print('command not found: ' + cmd + '. Type "help".', 'err'); }
  };

  print('Welcome. Type "help" to see what this shell can do.');
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hi > 0) { input.value = history[--hi]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { input.value = history[++hi] || ''; hi = Math.min(hi, history.length); e.preventDefault(); }
  });
  document.querySelectorAll('[data-run]').forEach((b) => b.addEventListener('click', () => run(b.dataset.run)));

  document.getElementById('year').textContent = new Date().getFullYear();
})();