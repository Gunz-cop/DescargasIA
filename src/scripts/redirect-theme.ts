/** Aplica el tema persistido de /r antes de que cargue su interacción. */

let theme = 'light';
try {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    theme = stored;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark';
  }
} catch {
  // Sin acceso a localStorage: se conserva el tema claro por defecto.
}
document.documentElement.dataset.theme = theme;
