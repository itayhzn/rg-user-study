import state from '../state.js';
import { renderProgressBar } from '../components/progress-bar.js';
import { createSnapSlider } from '../components/snap-slider.js';
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

  // Record start time for this question
  if (!state.promptStartTimes[pairIndex]) {
    state.promptStartTimes[pairIndex] = new Date().toISOString();
  }

  // Initialize responses for this question
  if (!state.responses[pairIndex]) {
    state.responses[pairIndex] = {};
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'study';

  // Progress bar
  const progressBar = renderProgressBar(
    state.config.study.title,
    questionIdx,
    total,
    state.config.study.show_save_exit,
    () => { window.location.hash = '#done'; }
  );
  wrapper.appendChild(progressBar);

  // Prompt banner
  const promptDiv = document.createElement('div');
  promptDiv.className = 'study__prompt';
  promptDiv.innerHTML = `
    <span class="study__prompt-label">PROMPT</span>
    <span class="study__prompt-text">&ldquo;${pair.prompt}&rdquo;</span>
  `;
  wrapper.appendChild(promptDiv);

  // Main content grid: image-left | metrics-panel | image-right
  const content = document.createElement('div');
  content.className = 'study__content';

  // Left image
  const leftSide = buildImagePanel('A', `${base}/${pairIndex}/${modelLeft}.png`);
  content.appendChild(leftSide);

  // Metrics panel (center)
  const metricsPanel = document.createElement('div');
  metricsPanel.className = 'metrics-panel';

  const allAnswered = () =>
    metrics.every(m => state.responses[pairIndex][m.id] !== undefined);

  for (const metric of metrics) {
    const currentVal = state.responses[pairIndex][metric.id] ?? null;
    const slider = createSnapSlider(metric.id, metric.label, currentVal, (metricId, value) => {
      state.responses[pairIndex][metricId] = value;
      updateNextBtn();
    });
    metricsPanel.appendChild(slider);
  }

  // Next button inside metrics panel
  const isLast = questionIdx === total - 1;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary study__next-btn';
  nextBtn.textContent = isLast ? 'Finish' : 'Next →';
  nextBtn.disabled = !allAnswered();
  nextBtn.addEventListener('click', () => {
    if (isLast) {
      window.location.hash = '#done';
    } else {
      window.location.hash = `#study/${questionIdx + 1}`;
    }
  });

  function updateNextBtn() {
    nextBtn.disabled = !allAnswered();
  }

  metricsPanel.appendChild(nextBtn);
  content.appendChild(metricsPanel);

  // Right image
  const rightSide = buildImagePanel('B', `${base}/${pairIndex}/${modelRight}.png`);
  content.appendChild(rightSide);

  wrapper.appendChild(content);
  app.appendChild(wrapper);
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
    imgWrap.title = 'Image not found';
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
