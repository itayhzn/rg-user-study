import state from '../state.js';
import { initializePairwiseSession } from '../randomization.js';

export function renderWelcome() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'welcome';

  const card = document.createElement('div');
  card.className = 'welcome__card';

  const title = state.config.study.title;
  const total = state.questionOrder.length || state.config.questions_per_session;

  card.innerHTML = `
    <h1 class="welcome__title">${title}</h1>
    <p class="welcome__description">
      You will compare pairs of AI-generated images across ${total} questions.
      For each pair, rate which image better matches each criterion using the sliders.
    </p>
    <div class="welcome__instructions">
      <strong>How it works:</strong>
      <ul>
        <li>Two images will be shown side by side.</li>
        <li>Drag each slider toward the image you prefer, or leave it centered for a tie.</li>
        <li>Click any image to view it full screen.</li>
      </ul>
    </div>
    <form class="welcome__form">
      <input
        type="text"
        class="welcome__input"
        placeholder="Enter your name to begin"
        autocomplete="name"
        required
      >
      <button type="submit" class="btn btn--primary">Start!</button>
    </form>
  `;

  const form = card.querySelector('form');
  const input = card.querySelector('input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) {
      input.classList.add('invalid');
      return;
    }

    state.userName = name;
    state.startTime = new Date().toISOString();
    state.responses = {};
    state.promptStartTimes = {};
    state.currentQuestion = 0;

    const { seed, sessionId, questionOrder } = initializePairwiseSession(
      name,
      state.manifest.pairs,
      state.config.questions_per_session
    );

    state.randomizationSeed = seed;
    state.sessionId = sessionId;
    state.questionOrder = questionOrder;

    window.location.hash = '#study/0';
  });

  input.addEventListener('input', () => input.classList.remove('invalid'));

  page.appendChild(card);
  app.appendChild(page);
  input.focus();
}
