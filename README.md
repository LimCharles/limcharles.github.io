# limcharles.github.io

Charles Lim's site, served at [whatischarlesupto.com](https://whatischarlesupto.com) (Cloudflare Pages) and [limcharles.github.io](https://limcharles.github.io) (GitHub Pages).

- `index.html`: the ask page (home), a chat about Charles with a few suggested questions.
- `projects/`: past projects.
- `assets/`: styles, the chat script, and `marks.js`, which paints the brush marks with [p5.brush](https://github.com/acamposuribe/p5.brush) (vendored in `assets/vendor/`).
- `content/`: the Markdown documents the chat answers from.
- `functions/api/ask.js`: the Cloudflare Pages Function behind the chat. It calls Gemini with File Search (RAG) and keeps the API key server-side.
- `scripts/upload-corpus.mjs`: uploads `content/` into a Gemini File Search store.
- `scripts/dev.py`: local preview with a fake `/api/ask`.

No build step. Everything is static except the one function.

## Preview locally

```bash
python3 scripts/dev.py
```

Open http://localhost:8766. The chat answers with a mock that quotes the closest document. To run the real function locally, use `npx wrangler pages dev .` with the variables below in a `.dev.vars` file.

## Set up the chat (free)

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey). The free tier covers File Search storage, query embeddings and Flash-Lite generation. On the free tier, Google may use prompts to improve its products; everything in `content/` is public anyway.
2. Upload the documents:

   ```bash
   GEMINI_API_KEY=your-key node scripts/upload-corpus.mjs
   ```

   It prints `FILE_SEARCH_STORE=fileSearchStores/...`.
3. After editing anything in `content/`, upload again and replace the old store:

   ```bash
   GEMINI_API_KEY=your-key node scripts/upload-corpus.mjs --replace fileSearchStores/old-name
   ```

   Then update `FILE_SEARCH_STORE` in Cloudflare.

## Deploy

**Cloudflare Pages (whatischarlesupto.com, runs the chat)**

1. Workers & Pages → Create → Pages → connect this GitHub repo, branch `master`.
2. Framework preset: none. Build command: empty. Build output directory: `/`.
3. Settings → Variables and Secrets: add `GEMINI_API_KEY` as a secret and `FILE_SEARCH_STORE` as text. `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`.
4. Custom domains → add `whatischarlesupto.com`. The domain is already on Cloudflare, so DNS is set up for you.

**GitHub Pages (limcharles.github.io)**

Settings → Pages → Deploy from a branch → `master`, folder `/`. Don't add a `CNAME` file: that would redirect limcharles.github.io to the custom domain instead of serving both. The github.io copy can't run functions, so its chat calls `https://whatischarlesupto.com/api/ask`, which allows that origin.
