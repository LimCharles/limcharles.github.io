// Serves /api/ask on whatischarlesupto.com with the same handler as the Pages Function,
// but as a Worker pinned near a US Google region (see wrangler.toml), so Gemini never
// sees a request from a data centre it rejects.
import { onRequestOptions, onRequestPost } from '../../functions/api/ask.js';

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/api/ask') return new Response('Not found', { status: 404 });
    if (request.method === 'OPTIONS') return onRequestOptions({ request, env });
    if (request.method === 'POST') return onRequestPost({ request, env });
    return new Response('Method not allowed', { status: 405 });
  },
};
