(() => {
  'use strict';
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

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
