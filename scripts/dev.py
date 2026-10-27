"""Local preview with a fake /api/ask, for working on the pages without Cloudflare or an API key.

    python3 scripts/dev.py          # http://localhost:8766

The fake answer just quotes the content/*.md file that shares the most words with the question.
To test the real function locally instead, use: npx wrangler pages dev .
"""
import json
import re
import sys
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
WORDS = re.compile(r"[a-z0-9]+")


def fake_answer(question):
    q = set(WORDS.findall(question.lower()))
    scored = []
    for path in sorted(CONTENT.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        scored.append((len(q & set(WORDS.findall(text.lower()))), path.stem, text))
    scored.sort(reverse=True)
    best = [s for s in scored[:2] if s[0] > 0]
    if not best:
        return {"answer": "(local mock) I don't know. Nothing in the documents matches that.", "sources": []}
    lines = [l for l in best[0][2].splitlines() if l and not l.startswith("#")]
    return {"answer": "(local mock) " + " ".join(lines[:2]), "sources": [s[1] for s in best]}


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/ask":
            self.send_error(404)
            return
        length = int(self.headers.get("content-length") or 0)
        body = json.loads(self.rfile.read(length) or b"{}")
        time.sleep(1.2)
        payload = json.dumps(fake_answer(str(body.get("question", "")))).encode()
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    print(f"http://localhost:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT))).serve_forever()
