import gpus from '../../data/hardware/gpus.json';
import appleSilicon from '../../data/hardware/apple-silicon.json';
import models from '../../data/hardware/models.json';

/**
 * Catálogo que necesita el motor interactivo de `/puedo-correr-ia`. Se sirve
 * como asset estático (patrón de `src/pages/search-index.json.ts`) para que
 * las ~360 KB de GPUs y modelos no viajen en el JavaScript inicial de la
 * página: la tabla server-rendered de `ModelTable.astro` sigue cubriendo el
 * camino sin JavaScript, y el motor interactivo pide este JSON recién cuando
 * la persona empieza a usar el formulario (ver `src/components/hardware/app.ts`).
 */
export function GET() {
  return new Response(JSON.stringify({ gpus, appleSilicon, models }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
