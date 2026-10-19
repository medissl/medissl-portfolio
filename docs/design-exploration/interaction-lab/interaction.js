const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('motion') === 'reduce';
document.documentElement.classList.toggle('reduce-motion', reducedMotion);
if (reducedMotion) document.documentElement.style.setProperty('--motion-time', '0s');
if (new URLSearchParams(location.search).get('motion') === 'reduce') {
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname.startsWith('/interaction-lab/')) {
      url.searchParams.set('motion', 'reduce');
      link.href = url.href;
    }
  });
}

document.querySelector('.skip')?.addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('main').focus();
});

// Preserve place and focus using normal document history, including browser Back.
document.querySelectorAll('[data-open]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    history.replaceState({ returnFocus: link.id, returnY: scrollY }, '');
    document.querySelectorAll('.transition-source').forEach(el => el.classList.remove('transition-source'));
    document.querySelectorAll('.transition-title').forEach(el => el.classList.remove('transition-title'));
    (link.querySelector('.title-word') || link.querySelector('h2'))?.classList.add('transition-title');
    const picture = document.body.classList.contains('direct') && innerWidth > 600
      ? document.querySelector('.index-preview')
      : link.querySelector('.scene-image, .row-image, .art-image');
    picture?.classList.add('transition-source');
  });
});

addEventListener('pageshow', () => {
  if (history.state?.returnFocus) {
    requestAnimationFrame(() => {
      document.getElementById(history.state.returnFocus)?.focus({ preventScroll: true });
      scrollTo(0, history.state.returnY || 0);
    });
  }
});

if (document.body.classList.contains('project-detail')) {
  const from = new URLSearchParams(location.search).get('from');
  const source = ['direct', 'artwork'].includes(from) ? from : 'worlds';
  const id = location.pathname.split('project-').pop().replace('.html', '');
  const expected = new URL(source + '.html', location.href);
  document.querySelectorAll('.return').forEach(link => {
    link.href = source + '.html#' + id;
    link.textContent = source === 'artwork' ? '← Back to artwork' : '← Back to work';
    link.addEventListener('click', event => {
      if (document.referrer && new URL(document.referrer).pathname === expected.pathname) {
        event.preventDefault();
        history.back();
      }
    });
  });
}

// A flashlight reveals the actual school capture; it does not gate any content.
if (!reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const school = document.querySelector('.scene.sakiko .scene-image');
  school?.addEventListener('pointermove', event => {
    const rect = school.getBoundingClientRect();
    school.style.setProperty('--light-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
    school.style.setProperty('--light-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
  });
}

const preview = document.querySelector('.index-preview');
if (preview) {
  const showPreview = row => {
    const project = previewProjects.find(p => p.id === row.dataset.preview);
    if (preview.dataset.project === project.id) return;
    preview.dataset.project = project.id;
    document.querySelectorAll('.index-row').forEach(item => item.classList.toggle('active', item === row));
    preview.className = 'index-preview ' + project.id;
    preview.innerHTML = project.second && project.shape === 'portrait'
      ? '<span class="paired"><img src="../assets/' + project.second + '" alt=""><img src="../assets/' + project.image + '" alt=""></span>'
      : '<img src="../assets/' + project.image + '" alt="">';
    if (!reducedMotion) preview.animate([{ opacity: 0.25, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
  };
  document.querySelectorAll('.index-row').forEach(row => {
    row.addEventListener('pointerenter', () => showPreview(row));
    row.addEventListener('focus', () => showPreview(row));
  });
}

// Expose actual cross-document transition state for read-only browser verification.
addEventListener('pagereveal', event => {
  document.documentElement.dataset.navigationTransition = event.viewTransition ? 'running' : 'none';
  event.viewTransition?.finished
    .then(() => { document.documentElement.dataset.navigationTransition = 'finished'; })
    .catch(() => { document.documentElement.dataset.navigationTransition = 'skipped'; });
});

// Local diagnostics: no analytics requests or visitor data storage.
addEventListener('load', () => requestAnimationFrame(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  document.documentElement.dataset.localLoadMs = String(Math.round(navigation?.duration || 0));
  document.documentElement.dataset.localTransferredBytes = String(performance.getEntriesByType('resource').reduce((sum, item) => sum + item.transferSize, 0));
}));

// The local review fixture receives real child-viewport measurements.
if (parent !== window) {
  const report = () => parent.postMessage({
    type: 'interaction-layout', width: innerWidth, height: innerHeight,
    content: document.documentElement.scrollWidth, focus: document.activeElement.id || 'page'
  }, location.origin);
  addEventListener('load', report);
  addEventListener('resize', report);
  addEventListener('pageshow', () => requestAnimationFrame(report));
  addEventListener('focusin', report);
}
