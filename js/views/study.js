import state from '../state.js';
import { renderProgressBar } from '../components/progress-bar.js';
import { openLightbox } from '../components/lightbox.js';

export function renderStudy(questionIdx) {
  const app = document.getElementById('app');
  app.innerHTML = '';

  state.currentQuestion = questionIdx;

  const total = state.questionOrder.length;
  const entry = state.questionOrder[questionIdx];
  const { pairIndex, modelLeft, modelRight } = entry;

  const pair = state.manifest.pairs.find(p => p.index === pairIndex);
  const metrics = state.config.metrics;
  const base = state.config.images_base_path;

  if (!state.promptStartTimes[pairIndex]) {
    state.promptStartTimes[pairIndex] = new Date().toISOString();
  }

  if (!state.responses[pairIndex]) {
    state.responses[pairIndex] = {};
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'study';

  wrapper.appendChild(renderProgressBar(
    state.config.study.title,
    questionIdx,
    total,
    state.config.study.show_save_exit,
    () => { window.location.hash = '#done'; }
  ));

  const promptDiv = document.createElement('div');
  promptDiv.className = 'study__prompt';
  promptDiv.innerHTML = `
    <span class="study__prompt-label">Prompt</span>
    <span class="study__prompt-text">&ldquo;${pair.prompt}&rdquo;</span>
  `;
  wrapper.appendChild(promptDiv);

  const content = document.createElement('div');
  content.className = 'study__content';

  content.appendChild(buildImagePanel('A', `${base}/${pairIndex}/${modelLeft}.png`));

  // Center: metric buttons + next
  const metricsPanel = document.createElement('div');
  metricsPanel.className = 'metrics-panel';

  const allAnswered = () =>
    metrics.every(m => state.responses[pairIndex][m.id] !== undefined);

  for (const metric of metrics) {
    const currentVal = state.responses[pairIndex][metric.id] ?? null;
    metricsPanel.appendChild(
      createMetricButtons(metric.id, metric.label, currentVal, (metricId, value) => {
        state.responses[pairIndex][metricId] = value;
        nextBtn.disabled = !allAnswered();
      })
    );
  }

  const isLast = questionIdx === total - 1;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary study__next-btn';
  nextBtn.textContent = isLast ? 'Finish' : 'Next →';
  nextBtn.disabled = !allAnswered();
  nextBtn.addEventListener('click', () => {
    window.location.hash = isLast ? '#done' : `#study/${questionIdx + 1}`;
  });
  metricsPanel.appendChild(nextBtn);

  content.appendChild(metricsPanel);
  content.appendChild(buildImagePanel('B', `${base}/${pairIndex}/${modelRight}.png`));

  wrapper.appendChild(content);
  app.appendChild(wrapper);
}

function createMetricButtons(metricId, label, initialValue, onChange) {
  const group = document.createElement('div');
  group.className = 'metric-btn-group';

  const heading = document.createElement('div');
  heading.className = 'metric-btn-group__label';
  heading.textContent = label;

  const buttons = document.createElement('div');
  buttons.className = 'metric-btn-group__buttons';

  const options = [
    { value: -1, text: 'A Wins', cls: 'metric-btn--a' },
    { value:  0, text: 'Tie',    cls: 'metric-btn--tie' },
    { value:  1, text: 'B Wins', cls: 'metric-btn--b' },
  ];

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = `metric-btn ${opt.cls}`;
    btn.textContent = opt.text;
    if (initialValue === opt.value) btn.classList.add('metric-btn--selected');

    btn.addEventListener('click', () => {
      buttons.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('metric-btn--selected'));
      btn.classList.add('metric-btn--selected');
      onChange(metricId, opt.value);
    });

    buttons.appendChild(btn);
  }

  group.appendChild(heading);
  group.appendChild(buttons);
  return group;
}

function buildImagePanel(label, src) {
  const side = document.createElement('div');
  side.className = 'study__side';

  const badge = document.createElement('div');
  badge.className = 'study__image-badge';
  badge.textContent = `Image ${label}`;

  const imgWrap = document.createElement('div');
  imgWrap.className = 'study__image-wrap';

  const skeleton = document.createElement('div');
  skeleton.className = 'study__image-skeleton';
  imgWrap.appendChild(skeleton);

  const img = document.createElement('img');
  img.className = 'study__image';
  img.alt = `Image ${label}`;

  img.addEventListener('load', () => {
    skeleton.remove();
    img.classList.add('study__image--loaded');
  });

  img.addEventListener('error', () => {
    skeleton.remove();
    imgWrap.classList.add('study__image-wrap--error');
  });

  img.src = src;
  imgWrap.appendChild(img);

  imgWrap.addEventListener('click', () => {
    if (img.complete && img.naturalWidth > 0) openLightbox(src);
  });

  side.appendChild(badge);
  side.appendChild(imgWrap);
  return side;
}
