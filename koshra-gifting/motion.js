(() => {
  const loader = document.querySelector('.site-loader');
  if (!loader) return;

  let revealed = false;
  const revealPage = () => {
    if (revealed) return;
    revealed = true;
    window.setTimeout(() => {
      document.body.classList.add('page-ready');
      loader.classList.add('is-leaving');
    }, 420);
  };

  if (document.readyState === 'complete') revealPage();
  else window.addEventListener('load', revealPage, { once: true });

  window.setTimeout(revealPage, 2400);

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (destination.href === window.location.href) return;

    event.preventDefault();
    document.body.classList.add('page-exit');
    window.setTimeout(() => window.location.assign(destination.href), 430);
  });
})();
