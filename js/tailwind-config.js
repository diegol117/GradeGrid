// Script clásico (NO módulo) — debe ejecutarse después del CDN de Tailwind.
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
};