# How this site's chat works

The chat on whatischarlesupto.com is a small retrieval-augmented generation (RAG) setup, built to run for free.

- The documents: a handful of short Markdown files about Charles (about, now, and one per project).
- Retrieval: the files are indexed in a Gemini API File Search store. Google handles chunking, embedding and search. On the free tier, storage and query-time embeddings cost nothing.
- Generation: a Gemini Flash-Lite model answers using only the retrieved passages, and the response includes citations back to the source files.
- Hosting: the pages are static (GitHub Pages and Cloudflare Pages). One Cloudflare Pages Function at /api/ask holds the API key and calls Gemini, so the key never reaches the browser.
- The chat doesn't keep a server-side history; the browser sends the last few turns with each question.

If the documents don't cover a question, the chat should say it doesn't know rather than guess.
