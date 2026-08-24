import gpus from '../../data/hardware/gpus.json';
import appleSilicon from '../../data/hardware/apple-silicon.json';
import models from '../../data/hardware/models.json';
import { canDetectHardware, detectHardware } from '../../lib/hardware/detect';
import type { DetectedHardware } from '../../lib/hardware/detect';
import { formatContext, formatGb, formatTps } from '../../lib/hardware/format';
import { recommend } from '../../lib/hardware/recommend';
import { resolveGpu } from '../../lib/hardware/resolve';
import type { Estimate, GpuSpec, ModelSpec, SpecSource, SystemSpecs, Vendor } from '../../lib/hardware/types';

type Copy = Record<string, string>;
type RuntimeUrls = Record<'ollama' | 'lm-studio' | 'jan', string>;
type AiGpuEstimate = Pick<NonNullable<SystemSpecs['gpu']>, 'vramGb' | 'bandwidthGbs' | 'vendor'>;
type ApiRecord = Record<string, unknown>;

const GPU_CATALOG = [...(gpus as GpuSpec[]), ...(appleSilicon as GpuSpec[])];
const MODEL_CATALOG = models as ModelSpec[];
const DEFAULT_CONTEXT = 4096;
const MIN_CONTEXT = 2048;
const MAX_CONTEXT = 131072;
const API_TIMEOUT_MS = 6000;

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

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : null;
}

function apiData(value: unknown): ApiRecord | null {
  const record = asRecord(value);
  if (!record || record.ok === false) return null;
  return asRecord(record.data) ?? asRecord(record.result) ?? record;
}

function numberFromUnknown(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') return numberFrom(value);
  return undefined;
}

function vendorFromUnknown(value: unknown): Vendor | undefined {
  if (value === 'nvidia' || value === 'amd' || value === 'intel' || value === 'apple' || value === 'other') return value;
  return undefined;
}

async function postOptional(path: string, body: unknown): Promise<unknown | null> {
  const controller = typeof AbortController === 'undefined' ? null : new AbortController();
  const timer = setTimeout(() => controller?.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller?.signal
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function partialSpecsFromApi(payload: unknown): Partial<SystemSpecs> | null {
  const data = apiData(payload);
  const specs = asRecord(data?.specs) ?? data;
  return specs ? specs as Partial<SystemSpecs> : null;
}

function aiGpuFromApi(payload: unknown): AiGpuEstimate | null {
  const data = apiData(payload);
  const gpu = asRecord(data?.gpu) ?? data;
  if (!gpu) return null;
  const result: AiGpuEstimate = {
    vramGb: numberFromUnknown(gpu.vramGb),
    bandwidthGbs: numberFromUnknown(gpu.bandwidthGbs),
    vendor: vendorFromUnknown(gpu.vendor)
  };
  return result.vramGb || result.bandwidthGbs || result.vendor ? result : null;
}

function explanationFromApi(payload: unknown): { text: string; tips: string[] } | null {
  const data = apiData(payload);
  if (!data) return null;
  const explanation = asRecord(data.explanation);
  const text = [data.text, data.message, data.explanation, explanation?.text]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const rawTips = data.tips ?? data.advice ?? explanation?.tips;
  const tips = Array.isArray(rawTips) ? rawTips.filter((tip): tip is string => typeof tip === 'string' && tip.trim().length > 0) : [];
  return text ? { text, tips } : null;
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
  const aiExplanation = root.querySelector<HTMLElement>('[data-hardware-ai-explanation]');
  const aiExplanationText = root.querySelector<HTMLElement>('[data-hardware-ai-explanation-text]');
  const aiExplanationTips = root.querySelector<HTMLUListElement>('[data-hardware-ai-explanation-tips]');
  const runtimeUrls = parseJson<RuntimeUrls>(root.dataset.hwRuntimeUrls, { ollama: '#', 'lm-studio': '#', jan: '#' });
  const lang = root.dataset.hwLang ?? 'es';

  if (!input || !options || !groups || !status || !template || !context) return;

  if (detectButton) detectButton.hidden = !canDetectHardware();

  const setDetectedChip = (field: string, visible: boolean, suffix?: string) => {
    root.querySelectorAll<HTMLElement>(`[data-hardware-detected-chip="${field}"]`).forEach((chip) => {
      chip.hidden = !visible;
      if (visible) chip.textContent = suffix ? `${textOf(root, 'detected')} · ${suffix}` : textOf(root, 'detected');
    });
  };

  const setAiChip = (field: string, visible: boolean) => {
    root.querySelectorAll<HTMLElement>(`[data-hardware-ai-chip="${field}"]`).forEach((chip) => {
      chip.hidden = !visible;
      if (visible) chip.textContent = textOf(root, 'aiEstimated');
    });
  };

  const clearAiExplanation = () => {
    if (aiExplanation) aiExplanation.hidden = true;
    if (aiExplanationText) aiExplanationText.textContent = '';
    if (aiExplanationTips) aiExplanationTips.replaceChildren();
  };

  let selectedGpu: GpuSpec | null = null;
  let typedGpuConfirmed = false;
  let aiGpuEstimate: AiGpuEstimate | null = null;
  let ramWasEdited = false;
  let activeOption = -1;
  let contextTokens = clampContext(numberFrom(context.value) ?? DEFAULT_CONTEXT);
  let remoteTimer: ReturnType<typeof setTimeout> | undefined;
  let remoteSequence = 0;
  let lastParsedText = '';
  let lastGpuLookupName = '';
  let lastExplainKey = '';

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
    const aiGpu = !gpu ? aiGpuEstimate : null;
    const explicitVram = numberFrom(vramInput?.value) ?? parseExplicitVram(rawName);
    const explicitRam = (ramWasEdited ? numberFrom(ramInput?.value) : undefined) ?? parseExplicitRam(rawName);
    const generic = parseGenericGb(rawName);
    const fallbackRam = explicitRam ?? (generic.length > 0 ? generic[generic.length - 1] : undefined);
    if (!rawName && !gpu && !explicitVram && !fallbackRam) return null;

    const gpuVram = gpu?.vramGb ?? explicitVram ?? aiGpu?.vramGb;
    const gpuSource: SpecSource = gpu ? 'db' : aiGpu ? 'ai-estimate' : 'user';
    return {
      gpu: rawName || gpu
        ? {
            id: gpu?.id,
            rawName: rawName || gpu?.name || '',
            vramGb: gpuVram,
            bandwidthGbs: gpu?.bandwidthGbs ?? aiGpu?.bandwidthGbs,
            vendor: vendorOf(gpu) ?? aiGpu?.vendor,
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

  const renderResults = (): { specs: SystemSpecs; estimates: Estimate[] } | null => {
    const specs = buildSpecs();
    groups.innerHTML = '';
    if (!specs) {
      setText(status, textOf(root, 'resultStart'));
      return null;
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
    return { specs, estimates };
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

  const applyParsedSpecs = (parsed: Partial<SystemSpecs>) => {
    let changed = false;
    const parsedGpu = parsed.gpu;
    const parsedGpuMatch = parsedGpu?.id ? GPU_CATALOG.find((gpu) => gpu.id === parsedGpu.id) : null;
    if (parsedGpuMatch && !effectiveGpu()) {
      selectedGpu = parsedGpuMatch;
      changed = true;
    }
    if (parsedGpu?.vramGb && vramInput && !numberFrom(vramInput.value)) {
      vramInput.value = String(parsedGpu.vramGb);
      changed = true;
    }
    if (parsed.ram?.totalGb && ramInput && !numberFrom(ramInput.value)) {
      ramInput.value = String(parsed.ram.totalGb);
      ramWasEdited = true;
      setDetectedChip('ram', false);
      changed = true;
    }
    if (parsed.cpu?.rawName && cpuInput && !cpuInput.value.trim()) {
      cpuInput.value = parsed.cpu.rawName;
      changed = true;
    }
    if (parsed.os && parsed.os !== 'unknown' && osInput && !osInput.value) {
      osInput.value = parsed.os;
      changed = true;
    }
    if (changed) apply();
  };

  const renderAiExplanation = (payload: unknown) => {
    const explanation = explanationFromApi(payload);
    if (!explanation || !aiExplanation || !aiExplanationText || !aiExplanationTips) return;
    aiExplanationText.textContent = explanation.text;
    aiExplanationTips.replaceChildren(...explanation.tips.map((tip) => {
      const item = document.createElement('li');
      item.textContent = tip;
      return item;
    }));
    aiExplanation.hidden = false;
  };

  const runOptionalApis = async (
    local: { specs: SystemSpecs; estimates: Estimate[] },
    sequence: number
  ) => {
    const rawName = local.specs.gpu?.rawName?.trim();
    const parsePromise = rawName && rawName !== lastParsedText
      ? postOptional('/api/hw/parse', { text: rawName.slice(0, 1024), lang })
      : Promise.resolve(null);
    if (rawName && rawName !== lastParsedText) lastParsedText = rawName;

    const unknownGpu = Boolean(rawName && local.specs.gpu && !local.specs.gpu.id);
    const lookupPromise = unknownGpu && rawName !== lastGpuLookupName
      ? postOptional('/api/hw/gpu-lookup', { name: rawName.slice(0, 256) })
      : Promise.resolve(null);
    if (unknownGpu && rawName) lastGpuLookupName = rawName;

    const verdict = local.estimates.map((estimate) => ({
      modelId: estimate.modelId,
      quant: estimate.quant,
      backend: estimate.backend,
      verdict: estimate.verdict,
      reason: estimate.reason,
      memory: estimate.memory,
      available: estimate.available,
      contextTokens: estimate.contextTokens,
      tokensPerSecond: estimate.tokensPerSecond
    }));
    const explainKey = JSON.stringify({ specs: local.specs, verdict, lang });
    const explainPromise = explainKey !== lastExplainKey
      ? postOptional('/api/hw/explain', { verdict, specs: local.specs, lang })
      : Promise.resolve(null);
    if (explainKey !== lastExplainKey) lastExplainKey = explainKey;

    const [parsedPayload, lookupPayload, explanationPayload] = await Promise.all([
      parsePromise,
      lookupPromise,
      explainPromise
    ]);
    if (sequence !== remoteSequence) return;

    const parsed = partialSpecsFromApi(parsedPayload);
    if (parsed) root.dispatchEvent(new CustomEvent('hardware:parsed', { detail: parsed }));

    const aiGpu = aiGpuFromApi(lookupPayload);
    if (aiGpu && rawName && input.value.trim() === rawName) {
      aiGpuEstimate = aiGpu;
      setAiChip('gpu', true);
      if (aiGpu.vramGb && vramInput && !numberFrom(vramInput.value)) vramInput.value = String(aiGpu.vramGb);
      apply();
    }

    renderAiExplanation(explanationPayload);
  };

  const scheduleOptionalApis = (local: { specs: SystemSpecs; estimates: Estimate[] } | null) => {
    if (remoteTimer) clearTimeout(remoteTimer);
    remoteSequence += 1;
    clearAiExplanation();
    if (!local) return;
    const sequence = remoteSequence;
    remoteTimer = setTimeout(() => {
      void runOptionalApis(local, sequence);
    }, 300);
  };

  const apply = () => {
    updateFieldVisibility();
    if (detailGpu && input.value !== detailGpu.value && document.activeElement !== detailGpu) detailGpu.value = input.value;
    contextTokens = clampContext(numberFrom(context.value) ?? DEFAULT_CONTEXT);
    context.value = String(contextTokens);
    if (contextOutput) contextOutput.value = formatContext(contextTokens);
    updateUrl();
    const local = renderResults();
    root.dispatchEvent(new CustomEvent('hardware:specs-change', { detail: buildSpecs() }));
    scheduleOptionalApis(local);
  };

  input.addEventListener('input', () => {
    selectedGpu = selectedResolution().gpu;
    typedGpuConfirmed = false;
    aiGpuEstimate = null;
    lastGpuLookupName = '';
    setAiChip('gpu', false);
    setDetectedChip('gpu', false);
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
      aiGpuEstimate = null;
      lastGpuLookupName = '';
      setAiChip('gpu', false);
      setDetectedChip('gpu', false);
    } else if (field === vramInput) {
      aiGpuEstimate = null;
      setAiChip('gpu', false);
    } else if (field === ramInput) {
      ramWasEdited = true;
      setDetectedChip('ram', false);
    } else if (field === cpuInput) {
      setDetectedChip('cpu', false);
    } else if (field === osInput) {
      setDetectedChip('os', false);
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
  root.addEventListener('hardware:detect-request', async () => {
    if (!detectButton) return;
    const restoreFocus = document.activeElement === detectButton;
    detectButton.disabled = true;
    try {
      const detail = await detectHardware();
      if (Object.keys(detail).length > 0) {
        root.dispatchEvent(new CustomEvent('hardware:detected', { detail }));
      }
    } finally {
      detectButton.disabled = false;
      if (restoreFocus) detectButton.focus();
    }
  });
  root.addEventListener('hardware:detected', (event) => {
    const detail = (event as CustomEvent<DetectedHardware>).detail;
    if (detail.gpu?.rawName) input.value = detail.gpu.rawName;
    if (detail.ramMinimumGb) {
      ramWasEdited = false;
      if (ramInput) ramInput.value = '';
      setDetectedChip('ram', true, textOf(root, 'ramMinimum').replace('{value}', String(detail.ramMinimumGb)));
    } else setDetectedChip('ram', false);
    if (detail.gpu?.vramGb && vramInput) vramInput.value = String(detail.gpu.vramGb);
    if (detail.cpu?.rawName && cpuInput) cpuInput.value = detail.cpu.rawName;
    if (detail.os && detail.os !== 'unknown' && osInput) osInput.value = detail.os;
    selectedGpu = detail.gpu?.id ? GPU_CATALOG.find((gpu) => gpu.id === detail.gpu?.id) ?? null : null;
    aiGpuEstimate = null;
    lastGpuLookupName = '';
    setAiChip('gpu', false);
    setDetectedChip('gpu', Boolean(detail.gpu?.rawName));
    setDetectedChip('cpu', Boolean(detail.cpu?.rawName));
    setDetectedChip('os', Boolean(detail.os && detail.os !== 'unknown'));
    typedGpuConfirmed = Boolean(detail.gpu?.rawName && !selectedGpu);
    setHidden(detectedNote, Object.keys(detail).length === 0);
    renderOptions();
    apply();
  });
  root.addEventListener('hardware:parsed', (event) => {
    const parsed = (event as CustomEvent<Partial<SystemSpecs>>).detail;
    if (parsed) applyParsedSpecs(parsed);
  });

  const url = new URL(window.location.href);
  input.value = url.searchParams.get('gpu') ?? '';
  if (vramInput) vramInput.value = url.searchParams.get('vram') ?? '';
  if (ramInput) ramInput.value = url.searchParams.get('ram') ?? '';
  ramWasEdited = Boolean(url.searchParams.get('ram'));
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
