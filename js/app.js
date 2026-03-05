import state from './state.js';
import { renderWelcome } from './views/welcome.js';
import { renderStudy } from './views/study.js';
import { renderDone } from './views/done.js';

function route() {
  const hash = window.location.hash || '#welcome';

  if (hash === '#welcome' || hash === '#' || hash === '') {
    renderWelcome();
  } else if (hash.startsWith('#study/')) {
    if (!state.userName) {
      window.location.hash = '#welcome';
      return;
    }
    const index = parseInt(hash.split('/')[1], 10);
    const total = state.questionOrder.length;
    if (isNaN(index) || index < 0 || index >= total) {
      window.location.hash = '#study/0';
      return;
    }
    renderStudy(index);
  } else if (hash === '#done') {
    if (!state.userName) {
      window.location.hash = '#welcome';
      return;
    }
    renderDone();
  } else {
    window.location.hash = '#welcome';
  }
}

async function init() {
  // Load config
  try {
    const res = await fetch('config.json');
    state.config = await res.json();
  } catch (e) {
    document.getElementById('app').innerHTML = `
      <div class="welcome">
        <div class="welcome__card">
          <h1 class="welcome__title">Configuration Error</h1>
          <p class="welcome__description">Could not load <code>config.json</code>.</p>
        </div>
      </div>
    `;
    return;
  }

  // Load manifest
  try {
    const res = await fetch(`${state.config.images_base_path}/manifest.json`);
    state.manifest = await res.json();
  } catch (e) {
    document.getElementById('app').innerHTML = `
      <div class="welcome">
        <div class="welcome__card">
          <h1 class="welcome__title">Manifest Error</h1>
          <p class="welcome__description">
            Could not load <code>images/manifest.json</code>.
            Run <code>python scripts/generate_manifest.py</code> first.
          </p>
        </div>
      </div>
    `;
    return;
  }

  // Portrait overlay
  const overlay = document.getElementById('portrait-overlay');
  if (overlay && state.config.study.rotate_prompt) {
    overlay.querySelector('.portrait-overlay__text').textContent = state.config.study.rotate_prompt;
    function updateOrientation() {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      overlay.classList.toggle('portrait-overlay--visible', isPortrait);
    }
    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
  }

  window.addEventListener('hashchange', route);
  route();
}

init();
