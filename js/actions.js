import { state, resetState } from './state.js';
import { showToast } from './utils.js';
import { renderTable } from './table.js';
import { recalculateAll } from './calculations.js';

export function updateCourseMeta() {
  const val = document.getElementById('course-name').value;
  state.courseName = val;
  document.getElementById('sheet-title-preview').textContent = val || 'Planilla de Calificaciones';
}

export function updateEvalProp(idx, prop, value) {
  state.evaluations[idx][prop] = value;
  recalculateAll();
}

export function updateStudentMeta(sIdx, prop, value) {
  state.students[sIdx][prop] = value;
}

export function updateGrade(sIdx, evalId, rawValue, inputEl) {
  state.students[sIdx].grades[evalId] = rawValue === '' ? '' : parseFloat(rawValue);

  const ev = state.evaluations.find(e => e.id === evalId);
  const isOverMax = rawValue !== '' && parseFloat(rawValue) > ev.maxScale;

  if (isOverMax) {
    inputEl.classList.remove('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-slate-700', 'text-slate-800', 'dark:text-slate-100');
    inputEl.classList.add('bg-rose-50', 'dark:bg-rose-950/60', 'border-rose-400', 'dark:border-rose-700', 'text-rose-700', 'dark:text-rose-300');
  } else {
    inputEl.classList.add('bg-white', 'dark:bg-slate-800/90', 'border-slate-200', 'dark:border-slate-700', 'text-slate-800', 'dark:text-slate-100');
    inputEl.classList.remove('bg-rose-50', 'dark:bg-rose-950/60', 'border-rose-400', 'dark:border-rose-700', 'text-rose-700', 'dark:text-rose-300');
  }

  recalculateAll();
}

export function addEvaluation() {
  const nextNum = state.evaluations.length + 1;
  state.evaluations.push({
    id: 'e' + Date.now(),
    name: `Eval ${nextNum}`,
    weight: 4,
    maxScale: 20
  });
  renderTable();
  showToast(`Columna "Eval ${nextNum}" agregada`);
}

export function removeEvaluation(idx) {
  if (state.evaluations.length <= 1) return;
  const removedName = state.evaluations[idx].name;
  state.evaluations.splice(idx, 1);
  renderTable();
  showToast(`Evaluación "${removedName}" eliminada`);
}

export function addStudent() {
  const nextNum  = state.students.length + 1;
  const paddedId = String(nextNum).padStart(3, '0');
  state.students.push({ id: paddedId, name: `Estudiante ${nextNum}`, grades: {} });
  renderTable();
  showToast(`Fila para Estudiante ${paddedId} agregada`);
}

export function removeStudent(sIdx) {
  if (state.students.length <= 1) return;
  const removedName = state.students[sIdx].name;
  state.students.splice(sIdx, 1);
  renderTable();
  showToast(`Estudiante "${removedName}" eliminado`);
}

export function clearGrades() {
  state.students.forEach(st => { st.grades = {}; });
  renderTable();
  showToast('Notas vaciadas · Listo para descargar como plantilla limpia');
}

export function resetExample() {
  resetState();
  document.getElementById('course-name').value = state.courseName;
  document.getElementById('course-max').value  = state.courseMax;
  document.getElementById('course-pass').value = state.coursePass;
  document.getElementById('sheet-title-preview').textContent = state.courseName;
  renderTable();
  showToast('Ejemplo restaurado con los 5 estudiantes');
}