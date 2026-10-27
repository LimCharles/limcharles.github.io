// Uploads content/*.md into a new Gemini File Search store and prints its name.
// Run again whenever the documents change, then point FILE_SEARCH_STORE at the new store.
//
//   GEMINI_API_KEY=... node scripts/upload-corpus.mjs
//   GEMINI_API_KEY=... node scripts/upload-corpus.mjs --replace fileSearchStores/old123   (also deletes the old store)
//
// Needs Node 18 or newer.

import { readdir, readFile } from 'node:fs/promises';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('Set GEMINI_API_KEY first.');
  process.exit(1);
}
const BASE = 'https://generativelanguage.googleapis.com';
const CONTENT = new URL('../content/', import.meta.url);
const replaceIdx = process.argv.indexOf('--replace');
const oldStore = replaceIdx > -1 ? process.argv[replaceIdx + 1] : null;

async function call(url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${url.split('?')[0]} → ${res.status}\n${text}`);
  return { res, data: text ? JSON.parse(text) : {} };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function startUpload(store, file, bytes, withMetadata) {
  const meta = { displayName: file };
  if (withMetadata) meta.customMetadata = [{ key: 'slug', stringValue: file.replace(/\.md$/, '') }];
  return fetch(`${BASE}/upload/v1beta/${store}:uploadToFileSearchStore?key=${KEY}`, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(bytes.length),
      'X-Goog-Upload-Header-Content-Type': 'text/markdown',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meta),
  });
}

async function upload(store, file) {
  const bytes = await readFile(new URL(file, CONTENT));
  let start = await startUpload(store, file, bytes, true);
  if (start.status === 400) {
    // Older API versions may reject customMetadata; the function can still map citations by file name.
    console.warn(`  ${file}: custom metadata rejected, uploading without it`);
    start = await startUpload(store, file, bytes, false);
  }
  if (!start.ok) throw new Error(`upload start failed for ${file}: ${start.status}\n${await start.text()}`);
  const uploadUrl = start.headers.get('x-goog-upload-url');
  if (!uploadUrl) throw new Error(`no upload URL returned for ${file}`);

  let { data: op } = await call(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Length': String(bytes.length), 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' },
    body: bytes,
  });
  // The finalize response is a long-running operation; wait until indexing finishes.
  while (op.name && !op.done) {
    await sleep(2000);
    ({ data: op } = await call(`${BASE}/v1beta/${op.name}?key=${KEY}`));
  }
  if (op.error) throw new Error(`indexing failed for ${file}: ${JSON.stringify(op.error)}`);
  console.log(`  ✓ ${file}`);
}

const files = (await readdir(CONTENT)).filter(f => f.endsWith('.md')).sort();
console.log(`Creating a File Search store for ${files.length} documents…`);
const { data: store } = await call(`${BASE}/v1beta/fileSearchStores?key=${KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ displayName: `whatischarlesupto-${new Date().toISOString().slice(0, 10)}` }),
});
console.log(`Store: ${store.name}`);

for (const file of files) await upload(store.name, file);

if (oldStore) {
  try {
    await call(`${BASE}/v1beta/${oldStore}?force=true&key=${KEY}`, { method: 'DELETE' });
    console.log(`Deleted old store ${oldStore}`);
  } catch (err) {
    // The new store is already complete, so a missing or mistyped old name shouldn't hide it.
    console.warn(`Couldn't delete ${oldStore} (it may not exist): ${err.message.split('\n')[0]}`);
  }
}

console.log(`\nDone. Set this in Cloudflare Pages (Settings → Variables and Secrets):\n  FILE_SEARCH_STORE=${store.name}`);
