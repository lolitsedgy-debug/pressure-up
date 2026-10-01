/* Presentation only: existing estimate, booking, CMS and pricing logic stay in app.js. */
(function () {
  const video = document.getElementById('heroVideo');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let videoAvailable = false;
  function updateVideo() {
    if (motion.matches || !videoAvailable) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.classList.remove('ready');
      return;
    }
    if (!video.hasAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.play().catch(() => video.classList.remove('ready'));
  }
  video.addEventListener('playing', () => video.classList.add('ready'));
  video.addEventListener('error', () => video.classList.remove('ready'));
  motion.addEventListener('change', updateVideo);
  // Optional assets are checked before use so an unfinished media delivery cannot break the page.
  async function exists(path) {
    try { return (await fetch(path, { method: 'HEAD' })).ok; } catch { return false; }
  }
  async function prepareMedia() {
    if (await exists('/media/pressure-up-hero-poster.webp')) {
      video.poster = '/media/pressure-up-hero-poster.webp';
      document.querySelector('.hero-bg').style.setProperty('--hero-poster', 'url("/media/pressure-up-hero-poster.webp")');
      document.querySelector('.hero-bg').style.backgroundSize = 'cover';
      document.querySelector('.hero-bg').style.backgroundPosition = '62% center';
    }
    videoAvailable = await exists(video.dataset.src);
    updateVideo();
    const portrait = '/media/owner-edgar-pressure-up.webp';
    if (await exists(portrait)) {
      const image = new Image();
      image.src = portrait;
      image.alt = 'Edgar, Pressure Up owner, with his pressure-washing equipment';
      image.loading = 'lazy';
      image.width = 640;
      image.height = 800;
      const holder = document.getElementById('ownerPhoto');
      holder.append(image);
      holder.hidden = false;
      holder.parentElement.classList.add('has-portrait');
    }
  }
  function translate() {
    const es = document.documentElement.lang === 'es';
    const copy = {
      heroEyebrow: ['2 MINUTE ESTIMATES', 'ESTIMADOS EN 2 MINUTOS'],
      trustTime: ['Takes about 2 minutes', 'Toma unos 2 minutos'],
      ownerEyebrow: ['OWNER-OPERATED', 'ATENDIDO POR EL DUEÑO'],
      ownerHeading: ['Hi, I’m Edgar.', 'Hola, soy Edgar.'],
      ownerBody: ['Owner-operated exterior cleaning with straightforward estimates, honest expectations, and careful work.', 'Limpieza exterior atendida por el dueño, con estimados claros, expectativas honestas y trabajo cuidadoso.']
    };
    for (const [id, words] of Object.entries(copy)) document.getElementById(id).textContent = words[es ? 1 : 0];
    document.querySelectorAll('.service-tab span:last-child').forEach((label, index) => {
      label.textContent = (es ? ['Entradas', 'Patios', 'Fachadas', 'Techos'] : ['Driveways', 'Patios', 'Siding', 'Roofs'])[index];
    });
    document.querySelector('.before-label').textContent = es ? 'Antes' : 'Before';
    document.querySelector('.after-label').textContent = es ? 'Después' : 'After';
    document.getElementById('baSlider').setAttribute('aria-label', es ? 'Comparar antes y después' : 'Compare before and after');
  }
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  translate();
  document.querySelectorAll('.ba-img').forEach(image => { image.loading = 'lazy'; image.decoding = 'async'; });
  document.getElementById('siteMenu').inert = true;
  new MutationObserver(() => {
    const menu = document.getElementById('siteMenu');
    menu.inert = !menu.classList.contains('open');
  }).observe(document.getElementById('siteMenu'), { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('siteMenu').classList.contains('open')) {
      document.getElementById('menuBtn').click();
      document.getElementById('menuBtn').focus();
    }
  });
  prepareMedia();
})();
