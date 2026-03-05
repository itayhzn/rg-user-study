export function renderProgressBar(title, current, total, showSaveExit, onSaveExit) {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';

  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  bar.innerHTML = `
    <span class="progress-bar__title">${title}</span>
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: ${pct}%"></div>
    </div>
    <span class="progress-bar__label">${current + 1} / ${total}</span>
  `;

  if (showSaveExit) {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn--ghost btn--sm';
    saveBtn.textContent = 'Save & Exit';
    saveBtn.addEventListener('click', onSaveExit);
    bar.appendChild(saveBtn);
  }

  return bar;
}
