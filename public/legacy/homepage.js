/* Presentation only. Existing pricing, authentication and booking handlers remain in app.js. */
(function () {
  const videos = [document.getElementById('heroVideo'), document.getElementById('heroVideoNext')];
  const poster = document.getElementById('heroPoster');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clips = [1, 2, 3, 4].map(n => `/media/hero-${n}.mp4`);
  let active = 0, clip = 0, transitioning = false, started = false, timer;
  const landing = document.getElementById('landing');
  const referenceStyles = document.getElementById('homepageReferenceStyles');
  // Remove every redesign override outside the homepage, retaining the exact baseline wizard styles.
  function syncStyles() { referenceStyles.disabled = !landing.classList.contains('active'); }
  syncStyles();
  new MutationObserver(syncStyles).observe(landing, { attributes: true, attributeFilter: ['class'] });
  const visible = () => !document.hidden && landing.classList.contains('active') && !motion.matches;
  videos.forEach(video => { video.muted = true; video.defaultMuted = true; video.playsInline = true; });
  function prepare(video, index) {
    video.src = clips[index];
    video.load();
  }
  // Keep the real poster until an actual video frame plays; never reveal an empty element.
  async function begin() {
    if (!visible() || started) return;
    if (!videos[0].getAttribute('src')) prepare(videos[0], 0);
    try {
      await videos[0].play();
      if (!visible()) { videos[0].pause(); return; }
      videos[0].classList.add('ready'); started = true;
      prepare(videos[1], 1);
    } catch { /* Safari low-power/autoplay restrictions: leave the portrait visible. */ }
  }
  async function advance() {
    if (transitioning || !visible()) return;
    transitioning = true;
    const previous = videos[active], next = videos[1 - active];
    try {
      next.currentTime = 0;
      await next.play();
      if (!visible()) { next.pause(); transitioning = false; return; }
      next.style.zIndex = '1'; previous.style.zIndex = '0';
      next.classList.add('ready');
      timer = setTimeout(() => {
        previous.pause(); previous.classList.remove('ready');
        active = 1 - active; clip = (clip + 1) % clips.length;
        prepare(previous, (clip + 1) % clips.length);
        transitioning = false;
      }, 700);
    } catch {
      // The old frame remains visible if a clip cannot load; retry at the next opportunity.
      previous.currentTime = 0; previous.play().catch(() => {}); transitioning = false;
    }
  }
  videos.forEach(video => {
    video.addEventListener('timeupdate', () => {
      if (video === videos[active] && started && video.duration - video.currentTime < .8) advance();
    });
    video.addEventListener('ended', () => { if (video === videos[active] && started) advance(); });
  });
  let posterShownAt;
  function schedule() {
    if (posterShownAt !== undefined) return;
    posterShownAt = performance.now();
    if (!motion.matches) { prepare(videos[0], 0); timer = setTimeout(begin, 2000); }
  }
  if (poster.complete && poster.naturalWidth) schedule(); else poster.addEventListener('load', schedule, { once: true });
  function syncPlayback() {
    if (!visible()) videos.forEach(video => video.pause());
    else if (started) videos[active].play().catch(() => {});
    else if (posterShownAt !== undefined && performance.now() - posterShownAt >= 2000) begin();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', syncPlayback);
  new MutationObserver(syncPlayback).observe(landing, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('pointerdown', () => {
    if (!started && posterShownAt !== undefined && performance.now() - posterShownAt >= 2000) begin();
  }, { passive: true });
  window.addEventListener('pagehide', () => { videos.forEach(video => video.pause()); });
  window.addEventListener('pageshow', syncPlayback);
  function translate() {
    if (new URLSearchParams(location.search).has('editor')) return;
    const es = document.documentElement.lang === 'es';
    const copy = {
      heroEyebrow: ['2 MINUTE ESTIMATES', 'ESTIMADOS EN 2 MINUTOS'],
      heroBody: ['Get a fast, no-obligation estimate online.', 'Recibe un estimado rápido y sin compromiso en línea.'],
      ownerEyebrow: ['OWNER-OPERATED', 'ATENDIDO POR EL DUEÑO'],
      ownerHeading: ['Hi, I’m Edgar.', 'Hola, soy Edgar.'],
      ownerBody: ['Owner-operated exterior cleaning with straightforward estimates, honest expectations, and careful work.', 'Limpieza exterior atendida por el dueño, con estimados claros, expectativas honestas y trabajo cuidadoso.'],
      localKicker: ['SERVING THE SOUTH BAY', 'AL SERVICIO DE SOUTH BAY'],
      localBody: ['Lawndale, Redondo Beach, Torrance, Hawthorne and surrounding areas.', 'Lawndale, Redondo Beach, Torrance, Hawthorne y sus alrededores.']
    };
    for (const [id, words] of Object.entries(copy)) document.getElementById(id).textContent = words[es ? 1 : 0];
    document.getElementById('heroHeading').innerHTML = es ? 'Mira el trabajo.<br>Recibe tu<br><em>estimado.</em>' : 'See the work.<br>Get your<br><em>estimate.</em>';
    document.getElementById('heroEstimateBtn').innerHTML = `<span>${es ? 'Obtener estimado' : 'Get My Estimate'}</span><span class="hero-arrow" aria-hidden="true">→</span>`;
    document.querySelectorAll('.service-tab span:last-child').forEach((label, index) => {
      label.textContent = (es ? ['Entradas', 'Patios', 'Fachadas', 'Techos'] : ['Driveways', 'Patios', 'Siding', 'Roofs'])[index];
    });
    document.querySelector('.before-label').textContent = es ? 'Antes' : 'Before';
    document.querySelector('.after-label').textContent = es ? 'Después' : 'After';
    document.getElementById('baSlider').setAttribute('aria-label', es ? 'Comparar antes y después' : 'Compare before and after');
    document.getElementById('menuBtn').setAttribute('aria-label', es ? 'Abrir menú' : 'Open menu');
    document.querySelectorAll('.job-pin').forEach(pin => { pin.dataset.job = es ? 'Área de servicio de Pressure Up' : 'Pressure Up service area'; });
  }
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  translate();
  const menu = document.getElementById('siteMenu');
  menu.inert = !menu.classList.contains('open');
  new MutationObserver(() => { menu.inert = !menu.classList.contains('open'); }).observe(menu, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      document.getElementById('menuBtn').click(); document.getElementById('menuBtn').focus();
    }
  });
})();
