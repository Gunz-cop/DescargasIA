/** CSP en observación (#88). Solo se adjunta a documentos HTML desde Worker. */

import { CSP_REPORT_PATH } from './csp-report';

export const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' https://www.highperformanceformat.com https://pl30788864.effectivecpmnetwork.com https://static.cloudflareinsights.com",
  `report-uri ${CSP_REPORT_PATH}`
].join('; ');

export function withCspReportOnly(response: Response): Response {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  headers.set('content-security-policy-report-only', CSP_REPORT_ONLY);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
