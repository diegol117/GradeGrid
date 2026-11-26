import { state } from './state.js';
import { getColLetter, formatNum } from './utils.js';

export function recalculateAll() {
  const courseMax  = parseFloat(document.getElementById('course-max').value)  || 20;
  const coursePass = parseFloat(document.getElementById('course-pass').value) || 10;
  state.courseMax  = courseMax;
  state.coursePass = coursePass;

  // 1) Validar ponderaciones
  const totalWeight = state.evaluations.reduce((acc, ev) => acc + (parseFloat(ev.weight) || 0), 0);
  const paramTotalEl = document.getElementById('param-total-weight');
  const paramPassEl  = document.getElementById('param-pass-display');
  const paramMaxEl   = document.getElementById('param-course-max-display');
  const badgeEl      = document.getElementById('weight-badge');

  if (paramTotalEl) paramTotalEl.textContent = `${formatNum(totalWeight)} pts`;
  if (paramPassEl)  paramPassEl.textContent  = formatNum(coursePass);
  if (paramMaxEl)   paramMaxEl.textContent   = formatNum(courseMax);

  const isWeightValid = Math.abs(totalWeight - courseMax) < 0.001;
  if (isWeightValid) {
    badgeEl.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold transition shrink-0';
    badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Ponderación exacta: ${formatNum(totalWeight)} / ${formatNum(courseMax)} pts`;
  } else {
    badgeEl.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-semibold transition shrink-0';
    badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Atención: Pesos suman ${formatNum(totalWeight)} / ${formatNum(courseMax)} pts`;
  }

  // 2) Calcular notas por estudiante
  let sumFinals = 0, sumRounds = 0, maxFinal = 0, maxRound = 0, approvedCount = 0;

  state.students.forEach((st, sIdx) => {
    let finalScore = 0;
    state.evaluations.forEach((ev) => {
      const raw = st.grades[ev.id];
      const numGrade = (raw === '' || raw === null || raw === undefined) ? 0 : parseFloat(raw);
      const scale  = parseFloat(ev.maxScale) || 1;
      const weight = parseFloat(ev.weight)   || 0;
      finalScore += (numGrade / scale) * weight;
    });

    const roundedScore = Math.round(finalScore + Number.EPSILON);
    const isApproved   = roundedScore >= coursePass;

    sumFinals += finalScore;
    sumRounds += roundedScore;
    if (finalScore   > maxFinal) maxFinal = finalScore;
    if (roundedScore > maxRound) maxRound = roundedScore;
    if (isApproved) approvedCount++;

    const finalEl  = document.getElementById(`st-final-${sIdx}`);
    const roundEl  = document.getElementById(`st-round-${sIdx}`);
    const statusEl = document.getElementById(`st-status-${sIdx}`);

    if (finalEl) finalEl.textContent = finalScore.toFixed(2);
    if (roundEl) roundEl.textContent = roundedScore;
    if (statusEl) {
      statusEl.innerHTML = isApproved
        ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">Aprobado</span>`
        : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">Reprobado</span>`;
    }
  });

  // 3) Promedios y máximos por evaluación
  state.evaluations.forEach((ev) => {
    const validGrades = state.students
      .map(st => st.grades[ev.id])
      .filter(v => v !== '' && v !== null && v !== undefined && !isNaN(parseFloat(v)))
      .map(v => parseFloat(v));

    const avgEl = document.getElementById(`avg-eval-${ev.id}`);
    const maxEl = document.getElementById(`max-eval-${ev.id}`);

    if (validGrades.length > 0) {
      const avg = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
      const max = Math.max(...validGrades);
      if (avgEl) avgEl.textContent = avg.toFixed(2);
      if (maxEl) maxEl.textContent = formatNum(max);
    } else {
      if (avgEl) avgEl.textContent = '—';
      if (maxEl) maxEl.textContent = '—';
    }
  });

  // 4) Totales del pie
  const stCount = state.students.length;
  document.getElementById('avg-final').textContent = stCount ? (sumFinals / stCount).toFixed(2) : '0.00';
  document.getElementById('avg-round').textContent = stCount ? (sumRounds / stCount).toFixed(1) : '0.0';
  document.getElementById('max-final').textContent = maxFinal.toFixed(2);
  document.getElementById('max-round').textContent = maxRound;
  document.getElementById('summary-approved').textContent = `${approvedCount}/${stCount} Aprob.`;
  document.getElementById('summary-failed').textContent   = `${stCount - approvedCount} Reprob.`;

  // 5) Visor didáctico de fórmulas
  updateFormulaPreview();
}

export function updateFormulaPreview() {
  const evalCount      = state.evaluations.length;
  const finalColLetter  = getColLetter(3 + evalCount);
  const roundColLetter  = getColLetter(4 + evalCount);
  const statusColLetter = getColLetter(5 + evalCount);

  const terms = state.evaluations.map((_, idx) => {
    const col = getColLetter(3 + idx);
    return `${col}4/$${col}$3*$${col}$2`;
  });

  document.getElementById('fx-final-cell').textContent = `${finalColLetter}4`;
  document.getElementById('fx-final-code').textContent = `=SUM(${terms.join(', ')})`;

  document.getElementById('fx-round-cell').textContent = `${roundColLetter}4`;
  document.getElementById('fx-round-code').textContent = `=ROUND(${finalColLetter}4, 0)`;

  document.getElementById('fx-status-cell').textContent = `${statusColLetter}4`;
  document.getElementById('fx-status-code').textContent = `=IF(${roundColLetter}4>=$${statusColLetter}$2, "Aprobado", "Reprobado")`;
}