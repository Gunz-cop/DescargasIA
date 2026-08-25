import { buildLlmsFullTxt } from '../utils/agent-content';

/** `/llms-full.txt` — llmstxt.org. Ver docs/agent-readiness.md. */
export async function GET() {
  return new Response(await buildLlmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
