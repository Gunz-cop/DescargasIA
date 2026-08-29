/** Interacciones comunes de la plantilla Astro, sin script inline. */

document.documentElement.classList.remove('no-js');

const menus = Array.from(document.querySelectorAll<HTMLDetailsElement>('header details'));

menus.forEach((menu) => {
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.open = false;
    });
  });
});

document.addEventListener('click', (event) => {
  const target = event.target;
  menus.forEach((menu) => {
    if (menu.open && target instanceof Node && !menu.contains(target)) menu.open = false;
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  menus.forEach((menu) => {
    if (menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
});
