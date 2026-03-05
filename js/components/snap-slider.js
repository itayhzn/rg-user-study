// 3-position snap slider: -1 (A Wins), 0 (Tie), 1 (B Wins)
// Positions: -1 → 16.67%, 0 → 50%, 1 → 83.33%

const SNAP_POSITIONS = [
  { value: -1, pct: 1 / 6 },
  { value: 0,  pct: 1 / 2 },
  { value: 1,  pct: 5 / 6 },
];

function getNearestSnap(pct) {
  let nearest = SNAP_POSITIONS[0];
  let minDist = Infinity;
  for (const snap of SNAP_POSITIONS) {
    const dist = Math.abs(pct - snap.pct);
    if (dist < minDist) {
      minDist = dist;
      nearest = snap;
    }
  }
  return nearest;
}

export function createSnapSlider(metricId, label, initialValue, onChange) {
  const container = document.createElement('div');
  container.className = 'snap-slider';
  container.dataset.value = initialValue === null ? 'null' : String(initialValue);
  container.dataset.metricId = metricId;

  const heading = document.createElement('div');
  heading.className = 'snap-slider__label';
  heading.textContent = label;

  const track = document.createElement('div');
  track.className = 'snap-slider__track';

  // Tick marks at snap positions
  for (const snap of SNAP_POSITIONS) {
    const tick = document.createElement('div');
    tick.className = 'snap-slider__tick';
    tick.style.left = `${snap.pct * 100}%`;
    track.appendChild(tick);
  }

  const knob = document.createElement('div');
  knob.className = 'snap-slider__knob' + (initialValue === null ? ' snap-slider__knob--null' : '');

  // Set initial knob position
  const initPct = initialValue === null ? 0.5 : SNAP_POSITIONS.find(s => s.value === initialValue)?.pct ?? 0.5;
  knob.style.left = `calc(${initPct * 100}% - 12px)`;

  track.appendChild(knob);

  const labelsEl = document.createElement('div');
  labelsEl.className = 'snap-slider__labels';
  labelsEl.innerHTML = '<span>A Wins</span><span>Tie</span><span>B Wins</span>';

  container.appendChild(heading);
  container.appendChild(track);
  container.appendChild(labelsEl);

  let isDragging = false;

  function setKnobPct(pct, animate) {
    knob.style.transition = animate ? 'left 0.15s ease' : 'none';
    knob.style.left = `calc(${pct * 100}% - 12px)`;
  }

  function pctFromEvent(e) {
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  track.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isDragging = true;
    track.setPointerCapture(e.pointerId);
    knob.classList.remove('snap-slider__knob--null');
    setKnobPct(pctFromEvent(e), false);
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    setKnobPct(pctFromEvent(e), false);
  });

  track.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.releasePointerCapture(e.pointerId);

    const { value, pct } = getNearestSnap(pctFromEvent(e));
    setKnobPct(pct, true);
    container.dataset.value = String(value);
    onChange(metricId, value);
  });

  track.addEventListener('pointercancel', () => {
    isDragging = false;
  });

  return container;
}
