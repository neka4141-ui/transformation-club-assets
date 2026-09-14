(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.querySelectorAll('.gold-button, .video-button, .tariff-link, .back-top, .dialog-ok, .floating-nav a');
  const navigation = document.querySelector('.floating-nav');
  if (navigation && 'IntersectionObserver' in window) {
    const navTargets = [document.querySelector('#tc-top'), document.querySelector('.tariff-stack'), document.querySelector('#tc-video')];
    const anchors = ['#tc-top', '#tc-tariffs', '#tc-video'];
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const href = anchors[navTargets.indexOf(entry.target)];
        navigation.querySelectorAll('a').forEach(link => {
          if (link.getAttribute('href') === href) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    navTargets.filter(Boolean).forEach(target => navObserver.observe(target));
  }
  document.querySelectorAll('a[href^="#tc-"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      const offset = navigation ? navigation.getBoundingClientRect().height + 12 : 20;
      window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset), behavior: motion.matches ? 'instant' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (navigation) navigation.querySelectorAll('a').forEach(item => {
        if (item.getAttribute('href') === link.getAttribute('href')) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
    });
  });
  let activePress = null;
  const releasePress = (cancelled = false) => {
    if (!activePress) return;
    activePress.control.classList.remove('is-pressed');
    if (cancelled && activePress.waveAnimation) activePress.waveAnimation.cancel();
    activePress = null;
  };
  controls.forEach(control => {
    const wave = document.createElement('span');
    wave.className = 'tap-wave';
    wave.setAttribute('aria-hidden', 'true');
    control.appendChild(wave);
    let waveAnimation;
    control.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      releasePress(true);
      if (waveAnimation) waveAnimation.cancel();
      const rect = control.getBoundingClientRect();
      const diameter = Math.hypot(rect.width, rect.height) * 2;
      wave.style.width = wave.style.height = `${diameter}px`;
      wave.style.left = `${event.clientX - rect.left}px`;
      wave.style.top = `${event.clientY - rect.top}px`;
      control.classList.add('is-pressed');
      if (!motion.matches && typeof wave.animate === 'function') {
        waveAnimation = wave.animate([
          { transform: 'translate(-50%, -50%) scale(0)', opacity: .48 },
          { transform: 'translate(-50%, -50%) scale(.65)', opacity: .2, offset: .55 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
        ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
      activePress = { control, waveAnimation, id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    control.addEventListener('keydown', event => {
      if (event.key === 'Enter' || (event.key === ' ' && control.tagName === 'BUTTON')) control.classList.add('is-pressed');
    });
    control.addEventListener('keyup', () => control.classList.remove('is-pressed'));
    control.addEventListener('blur', () => control.classList.remove('is-pressed'));
    motion.addEventListener('change', event => { if (event.matches && waveAnimation) waveAnimation.cancel(); });
  });
  window.addEventListener('pointerup', () => releasePress(), { passive: true });
  window.addEventListener('pointercancel', () => releasePress(true), { passive: true });
  window.addEventListener('blur', () => releasePress(true));
  window.addEventListener('pointermove', event => {
    if (activePress && event.pointerId === activePress.id && Math.hypot(event.clientX - activePress.x, event.clientY - activePress.y) > 12) releasePress(true);
  }, { passive: true });
  const dialog = document.querySelector('#action-dialog');
  const links = window.CLUB_LINKS || {};
  document.querySelectorAll('[data-action]').forEach(link => {
    const address = links[link.dataset.action];
    let valid = false;
    try { valid = Boolean(address) && new URL(address).protocol === 'https:'; } catch (_) {}
    if (valid) {
      link.href = address;
      link.rel = 'noopener';
    } else {
      link.addEventListener('click', event => {
        if (!dialog || typeof dialog.showModal !== 'function') return;
        event.preventDefault();
        const video = link.dataset.action === 'video';
        document.querySelector('#dialog-title').textContent = video ? 'Видео скоро появится' : 'Ссылка пока недоступна';
        document.querySelector('#dialog-message').textContent = video ? 'Пожалуйста, загляните чуть позже.' : 'Оплата и запись пока недоступны. Пожалуйста, попробуйте позже.';
        dialog.showModal();
      });
    }
  });
  dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });

  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-pending');
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -25px 0px' });
  document.querySelectorAll('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top < window.innerHeight * .95) return;
    element.classList.add('is-pending');
    observer.observe(element);
  });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    document.querySelectorAll('.is-pending').forEach(element => element.classList.remove('is-pending'));
  });
})();
