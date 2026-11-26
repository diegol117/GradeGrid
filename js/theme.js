function updateThemeUI(isDark) {
  const sunIcon  = document.getElementById('icon-sun');
  const moonIcon = document.getElementById('icon-moon');
  const label    = document.getElementById('theme-label');

  if (isDark) {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
    label.textContent = 'Modo Claro';
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
    label.textContent = 'Modo Oscuro';
  }
}

export function toggleTheme() {
  const htmlEl = document.documentElement;
  const isDark = htmlEl.classList.toggle('dark');
  updateThemeUI(isDark);
  try {
    localStorage.setItem('planilla-theme', isDark ? 'dark' : 'light');
  } catch (_) { /* sandbox sin storage */ }
}

export function initTheme() {
  let prefersDark = true; // default oscuro
  try {
    const saved = localStorage.getItem('planilla-theme');
    if (saved === 'light') prefersDark = false;
    else if (saved === 'dark') prefersDark = true;
  } catch (_) { /* mantener default */ }

  document.documentElement.classList.toggle('dark', prefersDark);
  updateThemeUI(prefersDark);
}