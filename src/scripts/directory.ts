  const section = document.getElementById('directorio');
  if (section) {
    const input = document.getElementById('directory-search') as HTMLInputElement | null;
    const clearBtn = document.getElementById('clear-search') as HTMLButtonElement | null;
    const emptyReset = document.getElementById('empty-reset') as HTMLButtonElement | null;
    const grid = document.getElementById('tools-grid');
    const emptyState = document.getElementById('empty-state');
    const counter = document.getElementById('results-count');
    const missing = document.getElementById('missing-count');
    const needLabel = document.getElementById('need-label');
    const live = document.getElementById('results-live');

    const chipsRow = document.getElementById('need-chips');
    const contextBar = document.getElementById('context-bar');
    const contextLabel = document.getElementById('context-label');
    const contextCount = document.getElementById('context-count');
    const headline = document.getElementById('conteo');

    const needChips = Array.from(document.querySelectorAll<HTMLButtonElement>('#need-chips button'));
    const secondaryChips = Array.from(
      document.querySelectorAll<HTMLButtonElement>('#secondary-filters button')
    );
    const cards = Array.from(grid?.querySelectorAll<HTMLElement>('article') ?? []);

    const allLabel = needLabel?.textContent ?? '';
    const KNOWN_BASELINE = 2;

    const state = { q: '', category: 'todos', platform: '', pricing: '' };

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
        .trim();

    const syncUrl = () => {
      const url = new URL(window.location.href);
      const set = (key: string, value: string, empty: string) => {
        if (value && value !== empty) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      };
      set('q', state.q, '');
      set('cat', state.category, 'todos');
      set('plat', state.platform, '');
      set('precio', state.pricing, '');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    };

    const apply = (updateUrl = true) => {
      const query = normalize(state.q);
      let visible = 0;

      cards.forEach((card) => {
        const matches =
          (!query || (card.dataset.name ?? '').includes(query)) &&
          (state.category === 'todos' || (card.dataset.categories ?? '').split(',').includes(state.category)) &&
          (!state.platform || (card.dataset.platforms ?? '').split(',').includes(state.platform)) &&
          (!state.pricing || card.dataset.pricing === state.pricing);

        card.hidden = !matches;
        if (matches) {
          // El retraso de la cascada se recalcula sobre lo que queda visible.
          card.dataset.riseIndex = String(visible);
          visible++;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
        // El animador del §3.3 lee `data-count-to`. Si se filtra antes de que
        // el contador entre en viewport, la animación arrancaba con el total
        // del build y pisaba el recuento real: se mantiene sincronizado.
        counter.dataset.countTo = String(visible);
      }
      if (missing) missing.textContent = String(Math.max(visible - KNOWN_BASELINE, 0));

      const active = needChips.find((chip) => chip.dataset.category === state.category);
      const activeName = (active?.childNodes[0]?.textContent ?? '').trim();
      if (needLabel) {
        needLabel.textContent = state.category === 'todos' ? allLabel : activeName.toLowerCase();
      }
      if (contextLabel) contextLabel.textContent = activeName || allLabel;
      if (contextCount) contextCount.textContent = String(visible);
      if (emptyState) emptyState.hidden = visible !== 0;
      if (grid) grid.hidden = visible === 0;
      if (clearBtn) clearBtn.hidden = state.q === '';
      if (live) live.textContent = String(visible);

      if (updateUrl) syncUrl();
    };

    // Estado inicial desde la URL (enlaces compartibles)
    const params = new URLSearchParams(window.location.search);
    state.q = params.get('q') ?? '';
    state.category = params.get('cat') ?? 'todos';
    state.platform = params.get('plat') ?? '';
    state.pricing = params.get('precio') ?? '';
    if (input) input.value = state.q;

    const paint = () => {
      needChips.forEach((chip) =>
        chip.setAttribute('aria-pressed', String(chip.dataset.category === state.category))
      );
      secondaryChips.forEach((chip) => {
        const on =
          (chip.dataset.platform && chip.dataset.platform === state.platform) ||
          (chip.dataset.pricing && chip.dataset.pricing === state.pricing);
        chip.setAttribute('aria-pressed', String(Boolean(on)));
      });
    };

    paint();
    apply(false);

    input?.addEventListener('input', () => {
      state.q = input.value;
      apply();
    });

    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        state.q = '';
        input.value = '';
        apply();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        grid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    clearBtn?.addEventListener('click', () => {
      state.q = '';
      if (input) {
        input.value = '';
        input.focus();
      }
      apply();
    });

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

    /**
     * Al filtrar, los resultados quedaban a más de una pantalla de distancia en
     * móvil: se tocaba un chip y aparentemente no pasaba nada. Se lleva al
     * titular de conteo, que es donde está la confirmación (número + necesidad).
     * Sólo se desplaza si de verdad no se ve, para no dar tirones en escritorio.
     */
    const revealResults = () => {
      if (!headline) return;
      const rect = headline.getBoundingClientRect();
      const alreadyVisible = rect.top >= 64 && rect.bottom <= window.innerHeight;
      if (alreadyVisible) return;
      headline.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    };

    needChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        state.category = chip.dataset.category ?? 'todos';
        paint();
        apply();
        revealResults();
      });
    });

    // --- Barra de contexto (móvil) ---
    if (contextBar && chipsRow && 'IntersectionObserver' in window) {
      const chipsObserver = new IntersectionObserver(
        ([entry]) => {
          // Sólo cuando los chips han salido por arriba, no al cargar la página.
          const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          contextBar.classList.toggle('is-visible', scrolledPast);
        },
        { threshold: 0 }
      );
      chipsObserver.observe(chipsRow);

      contextBar.addEventListener('click', () => {
        chipsRow.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
      });
    }

    secondaryChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        // Se comportan como conmutadores: volver a pulsar quita el filtro.
        if (chip.dataset.platform) {
          state.platform = state.platform === chip.dataset.platform ? '' : chip.dataset.platform;
        }
        if (chip.dataset.pricing) {
          state.pricing = state.pricing === chip.dataset.pricing ? '' : chip.dataset.pricing;
        }
        paint();
        apply();
      });
    });

    emptyReset?.addEventListener('click', () => {
      state.q = '';
      state.category = 'todos';
      state.platform = '';
      state.pricing = '';
      if (input) input.value = '';
      paint();
      apply();
      input?.focus();
    });
  }
