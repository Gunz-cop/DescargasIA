import gpus from '../../data/hardware/gpus.json';
import appleSilicon from '../../data/hardware/apple-silicon.json';
import models from '../../data/hardware/models.json';
import { formatContext, formatGb, formatTps } from '../../lib/hardware/format';
import { recommend } from '../../lib/hardware/recommend';
import { resolveGpu } from '../../lib/hardware/resolve';
import type { Estimate, GpuSpec, ModelSpec, SpecSource, SystemSpecs, Vendor } from '../../lib/hardware/types';

type Copy = Record<string, string>;
type RuntimeUrls = Record<'ollama' | 'lm-studio' | 'jan', string>;

const GPU_CATALOG = [...(gpus as GpuSpec[]), ...(appleSilicon as GpuSpec[])];
const MODEL_CATALOG = models as ModelSpec[];
const DEFAULT_CONTEXT = 4096;
const MIN_CONTEXT = 2048;
const MAX_CONTEXT = 131072;

function numberFrom(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function findNumber(text: string, pattern: RegExp): number | undefined {
  const match = pattern.exec(text);
  return numberFrom(match?.[1]);
}

function parseExplicitVram(text: string): number | undefined {
  return findNumber(text, /(?:vram|video\s+memory|gpu\s+memory|memory\s+total|memoria\s+(?:de\s+)?video)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:gb|gib)?/i);
}

function parseExplicitRam(text: string): number | undefined {
  return findNumber(text, /(?:ram|system\s+memory|systemram|minne|memoria\s+(?:del\s+sistema|ram))\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:gb|gib)?/i);
}

function parseGenericGb(text: string): number[] {
  return [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:gb|gib)\b/gi)]
    .map((match) => numberFrom(match[1]))
    .filter((value): value is number => value !== undefined);
}

function parseOs(text: string): SystemSpecs['os'] {
  if (/windows|win\s*\d+/i.test(text)) return 'windows';
  if (/mac\s*os|macbook|imac|apple/i.test(text)) return 'macos';
  if (/linux|ubuntu|fedora|debian/i.test(text)) return 'linux';
  return 'unknown';
}

function vendorOf(gpu: GpuSpec | null): Vendor | undefined {
  return gpu?.vendor;
}

function textOf(root: HTMLElement, key: string): string {
  const copy = JSON.parse(root.dataset.hwCopy ?? '{}') as Copy;
  return copy[key] ?? key;
}

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function setText(element: Element | null, value: string): void {
  if (element) element.textContent = value;
}

function setHidden(element: HTMLElement | null, hidden: boolean): void {
  if (element) element.hidden = hidden;
}

function clampContext(value: number): number {
  return Math.min(MAX_CONTEXT, Math.max(MIN_CONTEXT, Math.round(value / 1024) * 1024));
}

function initTooltips(root: HTMLElement): void {
  const triggers = [...root.querySelectorAll<HTMLButtonElement>('[data-tooltip-trigger]')];
  const closeAll = (except?: HTMLElement) => {
    triggers.forEach((trigger) => {
      if (trigger === except) return;
      const panel = document.getElementById(trigger.getAttribute('aria-describedby') ?? '') as HTMLElement | null;
      if (panel) panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });
  };

  triggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute('aria-describedby') ?? '') as HTMLElement | null;
    if (!panel) return;
    const open = () => {
      closeAll(trigger);
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('mouseleave', close);
    trigger.addEventListener('focus', open);
    trigger.addEventListener('blur', close);
    trigger.addEventListener('click', () => {
      if (panel.hidden) open();
      else close();
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Node) || !root.contains(event.target)) closeAll();
  });
}

export function initHardwareApp(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-hardware-free-input]');
  const detailGpu = root.querySelector<HTMLInputElement>('[data-hardware-detail-gpu]');
  const vramInput = root.querySelector<HTMLInputElement>('[data-hardware-vram]');
  const ramInput = root.querySelector<HTMLInputElement>('[data-hardware-ram]');
  const cpuInput = root.querySelector<HTMLInputElement>('[data-hardware-cpu]');
  const osInput = root.querySelector<HTMLSelectElement>('[data-hardware-os]');
  const options = root.querySelector<HTMLUListElement>('[data-hardware-options]');
  const details = root.querySelector<HTMLDetailsElement>('[data-hardware-details]');
  const form = root.querySelector<HTMLFormElement>('[data-hardware-form]');
  const context = root.querySelector<HTMLInputElement>('[data-hardware-context]');
  const contextOutput = root.querySelector<HTMLOutputElement>('[data-hardware-context-output]');
  const groups = root.querySelector<HTMLElement>('[data-hardware-result-groups]');
  const status = root.querySelector<HTMLElement>('[data-hardware-result-status]');
  const results = root.querySelector<HTMLElement>('[data-hardware-results]');
  const template = root.querySelector<HTMLTemplateElement>('[data-hardware-result-template]');
  const detectButton = root.querySelector<HTMLButtonElement>('[data-hardware-detect]');
  const detectedNote = root.querySelector<HTMLElement>('[data-hardware-detected-note]');
  const runtimeUrls = parseJson<RuntimeUrls>(root.dataset.hwRuntimeUrls, { ollama: '#', 'lm-studio': '#', jan: '#' });
  const lang = root.dataset.hwLang ?? 'es';

  if (!input || !options || !groups || !status || !template || !context) return;

  let selectedGpu: GpuSpec | null = null;
  let typedGpuConfirmed = false;
  let activeOption = -1;
  let contextTokens = clampContext(numberFrom(context.value) ?? DEFAULT_CONTEXT);

  const updateUrl = () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const fields: Array<[string, string | undefined]> = [
      ['gpu', input.value.trim() || undefined],
      ['vram', vramInput?.value || undefined],
      ['ram', ramInput?.value || undefined],
      ['os', osInput?.value || undefined],
      ['ctx', String(contextTokens)]
    ];
    fields.forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    window.history.replaceState(null, '', `${url.pathname}?${params.toString()}`);
  };

  const selectedResolution = () => resolveGpu(input.value, GPU_CATALOG);

  const effectiveGpu = (): GpuSpec | null => {
    const resolution = selectedResolution();
    if (selectedGpu) return selectedGpu;
    return resolution.gpu;
  };

  const updateFieldVisibility = () => {
    const resolution = selectedResolution();
    const unknown = typedGpuConfirmed && !effectiveGpu();
    const vramField = vramInput?.closest('label') as HTMLElement | null;
    setHidden(vramField, !unknown && !details?.open);
    if (unknown) {
      if (details) details.open = true;
      setText(root.querySelector('[data-hardware-combobox-help]'), textOf(root, 'comboAskVram'));
    } else if (resolution.gpu) {
      setText(root.querySelector('[data-hardware-combobox-help]'), textOf(root, 'comboHint'));
    }
  };

  const buildSpecs = (): SystemSpecs | null => {
    const rawName = input.value.trim();
    const gpu = effectiveGpu();
    const explicitVram = numberFrom(vramInput?.value) ?? parseExplicitVram(rawName);
    const explicitRam = numberFrom(ramInput?.value) ?? parseExplicitRam(rawName);
    const generic = parseGenericGb(rawName);
    const fallbackRam = explicitRam ?? (generic.length > 0 ? generic[generic.length - 1] : undefined);
    if (!rawName && !gpu && !explicitVram && !fallbackRam) return null;

    const gpuVram = gpu?.vramGb ?? explicitVram;
    const gpuSource: SpecSource = gpu ? 'db' : 'user';
    return {
      gpu: rawName || gpu
        ? {
            id: gpu?.id,
            rawName: rawName || gpu?.name || '',
            vramGb: gpuVram,
            bandwidthGbs: gpu?.bandwidthGbs,
            vendor: vendorOf(gpu),
            unifiedMemory: gpu?.unifiedMemory,
            source: gpuSource
          }
        : undefined,
      ram: fallbackRam ? { totalGb: fallbackRam, source: 'user' } : undefined,
      cpu: cpuInput?.value.trim() ? { rawName: cpuInput.value.trim(), source: 'user' } : undefined,
      os: osInput?.value || parseOs(rawName)
    };
  };

  const renderOptions = () => {
    const resolution = selectedResolution();
    const candidates = resolution.candidates;
    options.innerHTML = '';
    activeOption = -1;
    if (!input.value.trim()) {
      input.setAttribute('aria-expanded', 'false');
      options.hidden = true;
      return;
    }

    candidates.forEach((gpu, index) => {
      const option = document.createElement('li');
      option.id = `hardware-gpu-option-${index}`;
      option.role = 'option';
      option.dataset.gpuId = gpu.id;
      option.dataset.optionIndex = String(index);
      option.innerHTML = `<span>${gpu.name}</span><small>${gpu.unifiedMemory ? textOf(root, 'unifiedMemory') : `${gpu.vramGb ?? '—'} GB VRAM`}</small>`;
      options.append(option);
    });

    const useTyped = document.createElement('li');
    useTyped.id = 'hardware-gpu-option-typed';
    useTyped.role = 'option';
    useTyped.dataset.useTyped = 'true';
    useTyped.dataset.optionIndex = String(candidates.length);
    useTyped.innerHTML = `<span>${textOf(root, 'comboUseTyped')}</span><small>${textOf(root, 'comboTypedHint')}</small>`;
    options.append(useTyped);
    input.setAttribute('aria-expanded', 'true');
    options.hidden = false;
  };

  const setActiveOption = (index: number) => {
    const all = [...options.querySelectorAll<HTMLElement>('[role="option"]')];
    if (all.length === 0) return;
    activeOption = (index + all.length) % all.length;
    all.forEach((option, optionIndex) => {
      const active = optionIndex === activeOption;
      option.dataset.active = active ? 'true' : 'false';
      option.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    input.setAttribute('aria-activedescendant', all[activeOption]?.id ?? '');
  };

  const chooseOption = (option: HTMLElement) => {
    if (option.dataset.useTyped === 'true') {
      selectedGpu = null;
      typedGpuConfirmed = true;
      updateFieldVisibility();
    } else {
      const gpu = GPU_CATALOG.find((candidate) => candidate.id === option.dataset.gpuId);
      if (gpu) {
        selectedGpu = gpu;
        typedGpuConfirmed = false;
        input.value = gpu.name;
        if (detailGpu) detailGpu.value = gpu.name;
        if (vramInput && gpu.vramGb) vramInput.value = String(gpu.vramGb);
      }
    }
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-activedescendant', '');
    options.hidden = true;
    input.focus();
    apply();
  };

  const renderResults = () => {
    const specs = buildSpecs();
    groups.innerHTML = '';
    if (!specs) {
      setText(status, textOf(root, 'resultStart'));
      return;
    }

    const estimates = recommend(specs, MODEL_CATALOG, { contextTokens });
    const buckets: Array<{ key: string; title: string; estimates: Estimate[]; open: boolean }> = [
      { key: 'roomy', title: textOf(root, 'groupRoomy'), estimates: estimates.filter((e) => e.verdict === 'holgado'), open: true },
      { key: 'works', title: textOf(root, 'groupWorks'), estimates: estimates.filter((e) => e.verdict === 'funciona' || e.verdict === 'justo'), open: true },
      { key: 'no', title: textOf(root, 'groupNo'), estimates: estimates.filter((e) => e.verdict === 'no-cabe'), open: false }
    ];
    const compatible = estimates.filter((estimate) => estimate.verdict !== 'no-cabe').length;
    setText(status, `${compatible} ${textOf(root, 'resultsCount')}`);

    buckets.forEach((bucket) => {
      const detailsElement = document.createElement('details');
      detailsElement.className = 'hardware-result-group';
      detailsElement.open = bucket.open;
      const summary = document.createElement('summary');
      summary.className = 'hardware-result-group__summary';
      summary.innerHTML = `<span>${bucket.title}</span><span class="hardware-result-group__count">${bucket.estimates.length}</span>`;
      detailsElement.append(summary);
      const grid = document.createElement('div');
      grid.className = 'hardware-result-grid';
      bucket.estimates.forEach((result) => grid.append(createCard(result)));
      if (bucket.estimates.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'hardware-empty-group';
        empty.textContent = textOf(root, 'resultEmpty');
        grid.append(empty);
      }
      detailsElement.append(grid);
      groups.append(detailsElement);
    });
  };

  const createCard = (result: Estimate): HTMLElement => {
    const card = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const model = MODEL_CATALOG.find((candidate) => candidate.id === result.modelId);
    if (!model) return card;
    const setResult = (key: string, value: string) => setText(card.querySelector(`[data-result="${key}"]`), value);
    const verdictText = result.verdict === 'holgado' ? textOf(root, 'verdictRoomy') : result.verdict === 'no-cabe' ? textOf(root, 'verdictNo') : textOf(root, 'verdictWorks');
    card.dataset.verdict = result.verdict;
    setResult('name', model.displayName);
    setResult('size', `${model.paramsB < 1 ? Math.round(model.paramsB * 1000) + ' M' : model.paramsB + ' B'} · ${formatContext(result.contextTokens)}`);
    setResult('verdict', verdictText);
    setResult('weights', formatGb(result.memory.weights, lang));
    setResult('kv', formatGb(result.memory.kvCache, lang));
    setResult('overhead', formatGb(result.memory.overhead, lang));
    setResult('total', formatGb(result.memory.total, lang));
    setResult('available', result.available > 0 ? `${textOf(root, 'availableMemory')}: ${formatGb(result.available, lang)}` : textOf(root, 'availableUnknown'));
    setResult('quant', result.recommendedQuant ?? result.quant);
    setResult('speed', formatTps(result.tokensPerSecond, lang) || '—');
    setResult('reason', result.backend === 'partial-offload' ? textOf(root, 'offloadNote') : result.backend === 'unified' ? textOf(root, 'unifiedNote') : result.verdict === 'no-cabe' ? textOf(root, 'noFitNote') : textOf(root, 'estimateNotice'));

    const available = result.available > 0 ? result.available : result.memory.total;
    (['weights', 'kvCache', 'overhead'] as const).forEach((key) => {
      const segment = card.querySelector<HTMLElement>(`[data-segment="${key === 'kvCache' ? 'kv' : key}"]`);
      if (segment) segment.style.width = `${Math.min(100, (result.memory[key] / available) * 100)}%`;
    });
    const bar = card.querySelector<HTMLElement>('[data-result="memory-bar"]');
    if (bar) bar.setAttribute('aria-label', `${textOf(root, 'memoryBar')}: ${formatGb(result.memory.total, lang)} / ${formatGb(result.available, lang)}`);
    card.querySelectorAll<HTMLAnchorElement>('[data-runtime-link]').forEach((link) => {
      const key = link.dataset.runtimeLink as keyof RuntimeUrls;
      const href = runtimeUrls[key];
      if (href && href !== '#') {
        link.href = href;
        link.hidden = false;
      }
    });
    return card;
  };

  const apply = () => {
    updateFieldVisibility();
    if (detailGpu && input.value !== detailGpu.value && document.activeElement !== detailGpu) detailGpu.value = input.value;
    contextTokens = clampContext(numberFrom(context.value) ?? DEFAULT_CONTEXT);
    context.value = String(contextTokens);
    if (contextOutput) contextOutput.value = formatContext(contextTokens);
    updateUrl();
    renderResults();
    root.dispatchEvent(new CustomEvent('hardware:specs-change', { detail: buildSpecs() }));
  };

  input.addEventListener('input', () => {
    selectedGpu = selectedResolution().gpu;
    typedGpuConfirmed = false;
    renderOptions();
    apply();
  });
  input.addEventListener('focus', renderOptions);
  input.addEventListener('keydown', (event) => {
    const all = [...options.querySelectorAll<HTMLElement>('[role="option"]')];
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveOption(activeOption + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveOption(activeOption - 1);
    } else if (event.key === 'Enter' && activeOption >= 0 && all[activeOption]) {
      event.preventDefault();
      chooseOption(all[activeOption]!);
    } else if (event.key === 'Escape') {
      options.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-activedescendant', '');
    }
  });
  options.addEventListener('mousedown', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (option) {
      event.preventDefault();
      chooseOption(option);
    }
  });
  [vramInput, ramInput, cpuInput, osInput, detailGpu].forEach((field) => field?.addEventListener('input', () => {
    if (field === detailGpu && detailGpu) {
      input.value = detailGpu.value;
      selectedGpu = selectedResolution().gpu;
    }
    apply();
  }));
  details?.addEventListener('toggle', updateFieldVisibility);
  context.addEventListener('input', apply);
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
    results?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  detectButton?.addEventListener('click', () => {
    root.dispatchEvent(new CustomEvent('hardware:detect-request', { detail: { root } }));
  });
  root.addEventListener('hardware:detected', (event) => {
    const detail = (event as CustomEvent<Partial<SystemSpecs>>).detail;
    if (detail.gpu?.rawName) input.value = detail.gpu.rawName;
    if (detail.ram?.totalGb && ramInput) ramInput.value = String(detail.ram.totalGb);
    if (detail.gpu?.vramGb && vramInput) vramInput.value = String(detail.gpu.vramGb);
    if (detail.os && detail.os !== 'unknown' && osInput) osInput.value = detail.os;
    selectedGpu = detail.gpu?.id ? GPU_CATALOG.find((gpu) => gpu.id === detail.gpu?.id) ?? null : selectedResolution().gpu;
    typedGpuConfirmed = false;
    setHidden(detectedNote, false);
    apply();
  });
  root.addEventListener('hardware:parsed', (event) => root.dispatchEvent(new CustomEvent('hardware:detected', { detail: (event as CustomEvent).detail })));

  const url = new URL(window.location.href);
  input.value = url.searchParams.get('gpu') ?? '';
  if (vramInput) vramInput.value = url.searchParams.get('vram') ?? '';
  if (ramInput) ramInput.value = url.searchParams.get('ram') ?? '';
  if (osInput) osInput.value = url.searchParams.get('os') ?? '';
  contextTokens = clampContext(numberFrom(url.searchParams.get('ctx')) ?? DEFAULT_CONTEXT);
  context.value = String(contextTokens);
  selectedGpu = selectedResolution().gpu;
  initTooltips(root);
  renderOptions();
  apply();
}

function boot(): void {
  document.querySelectorAll<HTMLElement>('[data-hardware-app]').forEach(initHardwareApp);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
