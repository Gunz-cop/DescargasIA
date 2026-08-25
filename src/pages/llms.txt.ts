import { buildLlmsTxt } from '../utils/agent-content';

/** `/llms.txt` — llmstxt.org. Ver docs/agent-readiness.md. */
export async function GET() {
  return new Response(await buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
