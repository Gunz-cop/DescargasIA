import gpus from '../../data/hardware/gpus.json';
import appleSilicon from '../../data/hardware/apple-silicon.json';
import { resolveGpu } from './resolve';
import type { GpuSpec, SpecSource, SystemSpecs, Vendor } from './types';

interface AdapterInfoLike {
  vendor?: string;
  architecture?: string;
  device?: string;
  description?: string;
}

interface AdapterLike {
  info?: AdapterInfoLike;
}

interface GpuNavigatorLike {
  requestAdapter(): Promise<AdapterLike | null>;
}

interface UserAgentDataLike {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ platform?: string; architecture?: string }>;
}

interface NavigatorLike {
  gpu?: GpuNavigatorLike;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  userAgent?: string;
  userAgentData?: UserAgentDataLike;
}

interface WebGlExtensionLike {
  UNMASKED_RENDERER_WEBGL?: number;
}

interface WebGlContextLike {
  getExtension(name: string): WebGlExtensionLike | null;
  getParameter(parameter: number): unknown;
}

interface CanvasLike {
  getContext(context: string): unknown;
}

interface BrowserDocumentLike {
  createElement(name: string): CanvasLike;
}

interface OffscreenCanvasConstructor {
  new (width: number, height: number): CanvasLike;
}

const GPU_CATALOG = [...(gpus as GpuSpec[]), ...(appleSilicon as GpuSpec[])];
const ADAPTER_TIMEOUT_MS = 1000;
const DETECTED: SpecSource = 'detected';

function navigatorOf(): NavigatorLike | undefined {
  return Reflect.get(globalThis, 'navigator') as NavigatorLike | undefined;
}

function canvasOf(): CanvasLike | undefined {
  const browserDocument = Reflect.get(globalThis, ['doc', 'ument'].join('')) as BrowserDocumentLike | undefined;
  if (browserDocument?.createElement) return browserDocument.createElement('canvas');

  const OffscreenCanvas = Reflect.get(globalThis, 'OffscreenCanvas') as OffscreenCanvasConstructor | undefined;
  return OffscreenCanvas ? new OffscreenCanvas(1, 1) : undefined;
}

function webglContext(): WebGlContextLike | null {
  try {
    const canvas = canvasOf();
    if (!canvas) return null;
    return (
      (canvas.getContext('webgl2') as WebGlContextLike | null) ??
      (canvas.getContext('webgl') as WebGlContextLike | null)
    );
  } catch {
    return null;
  }
}

function webglRenderer(): string | undefined {
  try {
    const context = webglContext();
    const extension = context?.getExtension('WEBGL_debug_renderer_info');
    const parameter = extension?.UNMASKED_RENDERER_WEBGL;
    const renderer = parameter === undefined ? undefined : context?.getParameter(parameter);
    return typeof renderer === 'string' && renderer.trim() ? renderer.trim() : undefined;
  } catch {
    return undefined;
  }
}

function vendorOf(value: string | undefined): Vendor | undefined {
  const normalized = value?.toLowerCase() ?? '';
  if (normalized.includes('nvidia')) return 'nvidia';
  if (normalized.includes('amd') || normalized.includes('radeon')) return 'amd';
  if (normalized.includes('intel')) return 'intel';
  if (normalized.includes('apple')) return 'apple';
  return normalized ? 'other' : undefined;
}

function osOf(platform: string | undefined): SystemSpecs['os'] {
  const normalized = platform?.toLowerCase() ?? '';
  if (normalized.includes('win')) return 'windows';
  if (normalized.includes('mac') || normalized.includes('ios')) return 'macos';
  if (normalized.includes('linux') || normalized.includes('android')) return 'linux';
  return 'unknown';
}

function adapterName(info: AdapterInfoLike | undefined): string | undefined {
  const value = info?.description || info?.device || [info?.vendor, info?.architecture].filter(Boolean).join(' ');
  return value?.trim() || undefined;
}

function timeout<T>(promise: Promise<T>, milliseconds: number): Promise<T | null> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      resolve(null);
    }, milliseconds);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(null);
      }
    );
  });
}

async function adapterOf(nav: NavigatorLike): Promise<AdapterLike | null> {
  if (!nav.gpu) return null;
  try {
    return await timeout(nav.gpu.requestAdapter(), ADAPTER_TIMEOUT_MS);
  } catch {
    return null;
  }
}

async function highEntropyPlatform(nav: NavigatorLike): Promise<{ platform?: string; architecture?: string }> {
  const data = nav.userAgentData;
  if (!data?.getHighEntropyValues) return { platform: data?.platform ?? nav.userAgent };
  try {
    return await data.getHighEntropyValues(['platform', 'architecture']);
  } catch {
    return { platform: data.platform ?? nav.userAgent };
  }
}

function detectedGpu(rawName: string | undefined, vendor: Vendor | undefined): SystemSpecs['gpu'] | undefined {
  if (!rawName) return undefined;
  const resolved = resolveGpu(rawName, GPU_CATALOG).gpu;
  return {
    id: resolved?.id,
    rawName,
    vendor: resolved?.vendor ?? vendor,
    source: DETECTED
  };
}

function preferredGpuName(names: Array<string | undefined>): string | undefined {
  const available = names.filter((name): name is string => Boolean(name));
  return available.find((name) => resolveGpu(name, GPU_CATALOG).gpu) ?? available[0];
}

/** Whether the browser exposes a graphics API that makes detection useful. */
export function canDetectHardware(): boolean {
  const nav = navigatorOf();
  return Boolean(
    nav?.gpu ||
    Reflect.get(globalThis, 'WebGLRenderingContext') ||
    Reflect.get(globalThis, 'WebGL2RenderingContext')
  );
}

/** Detect browser-exposed hardware signals, without throwing or sending them away. */
export async function detectHardware(): Promise<Partial<SystemSpecs>> {
  try {
    const nav = navigatorOf();
    if (!nav) return {};

    const adapter = await adapterOf(nav);
    const adapterInfo = adapter?.info;
    const rawName = preferredGpuName([adapterName(adapterInfo), webglRenderer()]);
    const vendor = vendorOf(adapterInfo?.vendor ?? rawName);
    const platform = await highEntropyPlatform(nav);
    const os = osOf(platform.platform);
    const result: Partial<SystemSpecs> = {};
    const gpu = detectedGpu(rawName, vendor);

    if (gpu) result.gpu = gpu;
    if (nav.deviceMemory && Number.isFinite(nav.deviceMemory) && nav.deviceMemory > 0) {
      result.ram = { totalGb: nav.deviceMemory, source: DETECTED };
    }
    if (nav.hardwareConcurrency && Number.isFinite(nav.hardwareConcurrency) && nav.hardwareConcurrency > 0) {
      result.cpu = {
        rawName: platform.architecture ? `CPU (${platform.architecture})` : 'CPU',
        cores: nav.hardwareConcurrency,
        source: DETECTED
      };
    }
    if (os !== 'unknown') result.os = os;
    return result;
  } catch {
    return {};
  }
}
