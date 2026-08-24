import gpus from '../../data/hardware/gpus.json';
import appleSilicon from '../../data/hardware/apple-silicon.json';
import models from '../../data/hardware/models.json';

/**
 * Catálogo que necesita el motor interactivo. Se publica como asset estático
 * para que los casi 360 KB de datos no viajen en el JavaScript inicial de la
 * página; la tabla HTML sigue renderizándose en Astro para que el contenido
 * sea navegable sin JavaScript.
 */
export function GET() {
  return new Response(JSON.stringify({ gpus, appleSilicon, models }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
