import { initTheme, toggleTheme } from './theme.js';
import { renderTable } from './table.js';
import { recalculateAll } from './calculations.js';
import { exportToExcel } from './excel.js';
import * as actions from './actions.js';

/**
 * Los handlers inline (`onclick`, `oninput`, `onchange`) definidos en el HTML
 * y en las celdas generadas dinámicamente resuelven contra `window`.
 * Aquí exponemos solo lo necesario.
 */
Object.assign(window, {
  toggleTheme,
  exportToExcel,
  recalculateAll,
  updateCourseMeta: actions.updateCourseMeta,
  updateEvalProp:   actions.updateEvalProp,
  updateStudentMeta:actions.updateStudentMeta,
  updateGrade:      actions.updateGrade,
  addEvaluation:    actions.addEvaluation,
  removeEvaluation: actions.removeEvaluation,
  addStudent:       actions.addStudent,
  removeStudent:    actions.removeStudent,
  clearGrades:      actions.clearGrades,
  resetExample:     actions.resetExample
});

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderTable();
});