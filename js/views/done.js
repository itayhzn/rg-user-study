import state from '../state.js';

function buildRows(endTime) {
  const rows = [];
  const timestep = endTime;

  for (const entry of state.questionOrder) {
    const { pairDir, modelLeft, modelRight } = entry;
    const pair = state.manifest.pairs.find(p => p.dir === pairDir);
    const promptResponses = state.responses[pairDir] || {};
    const startTime = state.promptStartTimes[pairDir] || state.startTime;

    for (const metric of state.config.metrics) {
      const raw = promptResponses[metric.id];
      let modelWinner = 'unanswered';
      if (raw === -1) modelWinner = modelLeft;
      else if (raw === 0) modelWinner = 'tie';
      else if (raw === 1) modelWinner = modelRight;

      rows.push({
        timestep,
        session_id: state.sessionId,
        user: state.userName,
        start_time: startTime,
        end_time: endTime,
        prompt: pair ? pair.prompt : String(pairDir),
        metric: metric.id,
        model_left: modelLeft,
        model_right: modelRight,
        model_winner: modelWinner,
      });
    }
  }

  return rows;
}

function downloadJson(rows) {
  const blob = new Blob([JSON.stringify({ rows }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pairwise-response-${state.sessionId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function renderDone() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'done-page';

  const card = document.createElement('div');
  card.className = 'done-card';
  card.innerHTML = `
    <h2 class="done-card__title">Thank You!</h2>
    <p class="done-card__message">Submitting your responses&hellip;</p>
    <div class="spinner"></div>
    <div class="done-card__status"></div>
  `;

  page.appendChild(card);
  app.appendChild(page);

  const endTime = new Date().toISOString();
  const rows = buildRows(endTime);
  const statusEl = card.querySelector('.done-card__status');
  const spinner = card.querySelector('.spinner');
  const message = card.querySelector('.done-card__message');

  const scriptUrl = state.config.googleAppsScriptUrl;

  if (!scriptUrl || scriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
    spinner.remove();
    message.textContent = 'No submission endpoint configured. Downloading your responses as JSON.';
    downloadJson(rows);
    statusEl.className = 'done-card__status done-card__status--success';
    statusEl.textContent = 'File downloaded. You can send it to the study organizer.';
    return;
  }

  fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  })
    .then(() => {
      spinner.remove();
      message.textContent = 'Responses submitted successfully. Thank you!';
      statusEl.className = 'done-card__status done-card__status--success';
      statusEl.textContent = `${rows.length} row(s) sent.`;
    })
    .catch(() => {
      spinner.remove();
      message.textContent = 'Submission failed. Downloading your responses as JSON instead.';
      statusEl.className = 'done-card__status done-card__status--error';
      statusEl.textContent = 'Please send the downloaded file to the study organizer.';
      downloadJson(rows);
    });
}
