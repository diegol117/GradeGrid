/** Convierte índice de columna 1-based a letra Excel (1 -> A, 27 -> AA). */
export function getColLetter(colIndex) {
  let letter = '';
  while (colIndex > 0) {
    const rem = (colIndex - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    colIndex = Math.floor((colIndex - 1) / 26);
  }
  return letter;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatNum(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

let toastTimeout;
export function showToast(message, isError = false) {
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  msgEl.textContent  = message;
  iconEl.textContent = isError ? '⚠' : '✔';
  iconEl.className   = isError ? 'text-amber-400' : 'text-emerald-400';

  toast.classList.remove('translate-y-20', 'opacity-0');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3200);
}

export function thinBorder(argbColor) {
  return {
    top:    { style: 'thin', color: { argb: argbColor } },
    left:   { style: 'thin', color: { argb: argbColor } },
    bottom: { style: 'thin', color: { argb: argbColor } },
    right:  { style: 'thin', color: { argb: argbColor } }
  };
}