import { state } from './state.js';
import { getColLetter, escapeHtml } from './utils.js';
import { recalculateAll } from './calculations.js';

export function renderTable() {
  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');
  const tfoot = document.getElementById('table-foot');

  const evalCount      = state.evaluations.length;
  const finalColIdx    = 3 + evalCount;
  const roundColIdx    = finalColIdx + 1;
  const statusColIdx   = finalColIdx + 2;

  const finalColLetter  = getColLetter(finalColIdx);
  const roundColLetter  = getColLetter(roundColIdx);
  const statusColLetter = getColLetter(statusColIdx);

  // ---------- A. HEADER (3 filas: letras, títulos, parámetros) ----------
  thead.innerHTML = `
    <tr class="bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[11px] font-mono border-b border-slate-200 dark:border-slate-800 select-none">
      <th class="py-1 px-2 border-r border-slate-200 dark:border-slate-800 text-center w-16">A</th>
      <th class="py-1 px-3 border-r border-slate-200 dark:border-slate-800 text-left min-w-[190px]">B</th>
      ${state.evaluations.map((_, idx) => `
        <th class="py-1 px-2 border-r border-slate-200 dark:border-slate-800 text-center min-w-[115px]">${getColLetter(3 + idx)}</th>
      `).join('')}
      <th class="py-1 px-2 border-r border-slate-200 dark:border-slate-800 text-center min-w-[105px]">${finalColLetter}</th>
      <th class="py-1 px-2 border-r border-slate-200 dark:border-slate-800 text-center min-w-[95px]">${roundColLetter}</th>
      <th class="py-1 px-3 text-center min-w-[115px]">${statusColLetter}</th>
    </tr>

    <tr class="bg-slate-800 dark:bg-slate-950 text-white text-xs uppercase tracking-wider border-b border-slate-700 dark:border-slate-800">
      <th class="py-3 px-2.5 border-r border-slate-700 dark:border-slate-800 text-center font-semibold">ID</th>
      <th class="py-3 px-3.5 border-r border-slate-700 dark:border-slate-800 text-left font-semibold">Estudiante</th>
      ${state.evaluations.map((ev, idx) => `
        <th class="py-2 px-2 border-r border-slate-700 dark:border-slate-800 font-semibold group relative">
          <div class="flex items-center justify-center gap-1">
            <input type="text" value="${escapeHtml(ev.name)}"
              onchange="updateEvalProp(${idx}, 'name', this.value)"
              aria-label="Nombre de evaluación ${idx + 1}"
              class="w-full bg-transparent hover:bg-slate-700/70 dark:hover:bg-slate-800 focus:bg-slate-700 dark:focus:bg-slate-800 text-white text-center text-xs font-semibold rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition" />
            ${evalCount > 1 ? `
              <button onclick="removeEvaluation(${idx})" title="Eliminar evaluación"
                class="opacity-40 hover:opacity-100 text-rose-300 hover:text-rose-200 p-0.5 rounded transition cursor-pointer shrink-0">✕</button>
            ` : ''}
          </div>
        </th>
      `).join('')}
      <th class="py-3 px-2.5 border-r border-slate-700 dark:border-slate-800 text-center font-semibold bg-slate-900/60 dark:bg-slate-900">Nota Final</th>
      <th class="py-3 px-2.5 border-r border-slate-700 dark:border-slate-800 text-center font-semibold bg-slate-900/60 dark:bg-slate-900">Definitiva</th>
      <th class="py-3 px-3 text-center font-semibold bg-slate-900/60 dark:bg-slate-900">Estado</th>
    </tr>

    <tr class="bg-indigo-50/90 dark:bg-indigo-950/45 border-b border-indigo-200/80 dark:border-indigo-900/60 text-xs">
      <td class="py-2 px-2 border-r border-indigo-200/70 dark:border-indigo-900/60 text-center font-mono text-[11px] text-indigo-500 dark:text-indigo-400">Fila 2</td>
      <td class="py-2 px-3.5 border-r border-indigo-200/70 dark:border-indigo-900/60 font-semibold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
        <span>Peso (pts)</span>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">$2</span>
      </td>
      ${state.evaluations.map((ev, idx) => `
        <td class="py-1.5 px-2 border-r border-indigo-200/70 dark:border-indigo-900/60 text-center">
          <input type="number" step="0.5" min="0" value="${ev.weight}"
            oninput="updateEvalProp(${idx}, 'weight', parseFloat(this.value) || 0)"
            aria-label="Peso de ${escapeHtml(ev.name)}"
            class="w-20 mx-auto block text-center font-bold text-indigo-900 dark:text-indigo-200 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition" />
        </td>
      `).join('')}
      <td id="param-total-weight" class="py-2 px-2.5 border-r border-indigo-200/70 dark:border-indigo-900/60 text-center font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-900/40"></td>
      <td class="py-2 px-2.5 border-r border-indigo-200/70 dark:border-indigo-900/60 text-right text-[11px] font-medium text-indigo-800 dark:text-indigo-300">Mín. Aprob:</td>
      <td id="param-pass-display" class="py-2 px-3 text-center font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-900/40"></td>
    </tr>

    <tr class="bg-sky-50/70 dark:bg-sky-950/35 border-b-2 border-slate-300 dark:border-slate-700 text-xs">
      <td class="py-2 px-2 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-[11px] text-sky-600 dark:text-sky-400">Fila 3</td>
      <td class="py-2 px-3.5 border-r border-slate-200 dark:border-slate-800 font-semibold text-sky-950 dark:text-sky-200 flex items-center justify-between">
        <span>Escala máx.</span>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300">$3</span>
      </td>
      ${state.evaluations.map((ev, idx) => `
        <td class="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 text-center">
          <input type="number" step="1" min="1" value="${ev.maxScale}"
            oninput="updateEvalProp(${idx}, 'maxScale', parseFloat(this.value) || 1)"
            aria-label="Escala máxima de ${escapeHtml(ev.name)}"
            class="w-20 mx-auto block text-center font-semibold text-sky-900 dark:text-sky-200 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition" />
        </td>
      `).join('')}
      <td id="param-course-max-display" class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-sky-950 dark:text-sky-200 bg-sky-100/50 dark:bg-sky-900/35"></td>
      <td colspan="2" class="py-2 px-3 text-center text-[11px] text-slate-400 dark:text-slate-500 italic">Base de calificación por columna</td>
    </tr>
  `;

  // ---------- B. BODY (estudiantes) ----------
  tbody.innerHTML = state.students.map((st, sIdx) => {
    const rowBg = sIdx % 2 === 0
      ? 'bg-white dark:bg-slate-900'
      : 'bg-slate-50/50 dark:bg-slate-900/60';
    return `
      <tr class="${rowBg} hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition group" data-student-idx="${sIdx}">
        <td class="py-2 px-2 border-r border-slate-200 dark:border-slate-800 text-center">
          <input type="text" value="${escapeHtml(st.id)}"
            onchange="updateStudentMeta(${sIdx}, 'id', this.value)"
            class="w-12 text-center font-mono text-xs text-slate-600 dark:text-slate-400 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-400 rounded py-1 focus:outline-none" />
        </td>
        <td class="py-2 px-3 border-r border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between gap-1">
            <input type="text" value="${escapeHtml(st.name)}"
              onchange="updateStudentMeta(${sIdx}, 'name', this.value)"
              class="w-full font-medium text-slate-800 dark:text-slate-100 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-400 rounded px-1.5 py-1 focus:outline-none" />
            ${state.students.length > 1 ? `
              <button onclick="removeStudent(${sIdx})" title="Eliminar fila"
                class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 text-xs px-1 transition cursor-pointer">✕</button>
            ` : ''}
          </div>
        </td>
        ${state.evaluations.map((ev) => {
          const val = st.grades[ev.id] !== undefined && st.grades[ev.id] !== null ? st.grades[ev.id] : '';
          const isOverMax = val !== '' && parseFloat(val) > ev.maxScale;
          return `
            <td class="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 text-center">
              <input type="number" step="0.1" min="0" max="${ev.maxScale}"
                value="${val}" placeholder="—"
                data-student="${sIdx}" data-eval="${ev.id}"
                oninput="updateGrade(${sIdx}, '${ev.id}', this.value, this)"
                class="w-20 mx-auto block text-center font-medium rounded-lg py-1.5 px-2 border transition focus:outline-none focus:ring-2 ${
                  isOverMax
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300 focus:ring-rose-500/30'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30'
                }" />
            </td>
          `;
        }).join('')}
        <td id="st-final-${sIdx}" class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-800/40">0.00</td>
        <td id="st-round-${sIdx}" class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-800/40">0</td>
        <td id="st-status-${sIdx}" class="py-2 px-3 text-center bg-slate-50/80 dark:bg-slate-800/40"></td>
      </tr>
    `;
  }).join('');

  // ---------- C. FOOTER (resumen) ----------
  tfoot.innerHTML = `
    <tr class="text-xs">
      <td colspan="2" class="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 text-right uppercase tracking-wider text-slate-500 dark:text-slate-400">Promedio del Grupo</td>
      ${state.evaluations.map((ev) => `
        <td id="avg-eval-${ev.id}" class="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-700 dark:text-slate-300">—</td>
      `).join('')}
      <td id="avg-final" class="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/50">0.00</td>
      <td id="avg-round" class="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-800 dark:text-slate-200">0.0</td>
      <td id="summary-approved" class="py-2.5 px-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40">0/0 Aprob.</td>
    </tr>
    <tr class="text-xs bg-slate-100/70 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
      <td colspan="2" class="py-2 px-3.5 border-r border-slate-200 dark:border-slate-800 text-right uppercase tracking-wider text-slate-500 dark:text-slate-400">Nota Máxima</td>
      ${state.evaluations.map((ev) => `
        <td id="max-eval-${ev.id}" class="py-2 px-2 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-600 dark:text-slate-400">—</td>
      `).join('')}
      <td id="max-final" class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-800 dark:text-slate-200">0.00</td>
      <td id="max-round" class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-800 dark:text-slate-200">0</td>
      <td id="summary-failed" class="py-2 px-3 text-center text-xs font-medium text-rose-600 dark:text-rose-400">0 Reprob.</td>
    </tr>
  `;

  recalculateAll();
}