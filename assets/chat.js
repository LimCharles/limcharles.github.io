// The ask-me-anything chat. Sends the question plus the last few turns to /api/ask
// (a Cloudflare Pages Function) and shows the answer with the documents it cited.
(() => {
  const ENDPOINT = (() => {
    const meta = document.querySelector('meta[name="ask-endpoint"]');
    if (meta && meta.content) return meta.content;
    // GitHub Pages can't run the function, so the github.io copy calls the Cloudflare one.
    return location.hostname.endsWith('github.io') ? 'https://whatischarlesupto.com/api/ask' : '/api/ask';
  })();

  // document slug -> [label, link]
  const SOURCES = {
    laile: ['Laile', '/projects/#laile'],
    vahumana: ['vahumana', '/projects/#vahumana'],
    haitham: ['Haitham', '/projects/#haitham'],
    motif: ['motif identification', '/projects/#motif'],
    janna: ['Janna', '/projects/#earlier'],
    foodoptions: ['FoodOptions', '/projects/#earlier'],
    deliverease: ['DeliveryEase', '/projects/#earlier'],
    detectiveemolga: ['DetectiveEmolga', '/projects/#earlier'],
    cats: ['CATS', 'https://github.com/LimCharles/CATS'],
    'siti-led-cms': ['siti-led-cms', 'https://github.com/LimCharles/siti-led-cms'],
    resume: ['resume'],
    experience: ['experience'],
    about: ['about'],
    now: ['now'],
    site: ['how this chat works'],
  };

  // shown above the input until the first question
  const SUGGESTED = [
    'what is charles up to?',
    'what has he built with LLMs?',
    'where has he worked?',
    'how does this chat work?',
  ];

  const form = document.getElementById('ask');
  const input = document.getElementById('q');
  const thread = document.getElementById('thread');
  const button = form.querySelector('button');
  const history = [];
  let busy = false;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // Plain text in, paragraphs and lists out. **bold** and *italic* are the only inline markup kept.
  function inline(parent, text) {
    const re = /\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.append(document.createTextNode(text.slice(last, m.index)));
      parent.append(m[1] != null ? el('strong', '', m[1]) : el('em', '', m[2]));
      last = re.lastIndex;
    }
    if (last < text.length) parent.append(document.createTextNode(text.slice(last)));
    return parent;
  }
  function render(answer) {
    return answer.trim().split(/\n\s*\n/).map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length && lines.every(l => /^[-*•]\s+/.test(l))) {
        const ul = el('ul');
        lines.forEach(l => ul.append(inline(el('li'), l.replace(/^[-*•]\s+/, ''))));
        return ul;
      }
      return inline(el('p'), lines.join(' '));
    });
  }

  function sourceLine(slugs) {
    const p = el('p', 'src');
    p.append(el('span', 'label', 'sources'));
    slugs.forEach(slug => {
      const [label, href] = SOURCES[slug] || [slug];
      const s = el(href ? 'a' : 'span', 'chip', label);
      if (href) s.href = href;
      p.append(s);
    });
    return p;
  }

  function sync() {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
    button.disabled = busy || !input.value.trim();
  }

  const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  async function ask(question) {
    busy = true;
    document.body.classList.add('started-page');
    thread.querySelectorAll('.turn.latest').forEach(t => t.classList.remove('latest'));

    const turn = el('div', 'turn latest');
    const answer = el('div', 'a');
    answer.setAttribute('aria-busy', 'true');
    answer.append(el('span', 'cursor'));
    turn.append(el('p', 'q', question), answer);
    thread.append(turn);
    turn.scrollIntoView({ block: 'end', behavior: smooth });

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, history: history.slice(-4) }),
      });
      if (res.status === 404) throw new Error("The chat isn't connected here yet.");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.answer) throw new Error(data.error || 'The chat had a problem. Try again.');
      answer.replaceChildren(...render(data.answer));
      if (data.sources && data.sources.length) turn.append(sourceLine(data.sources));
      history.push({ q: question, a: data.answer });
    } catch (err) {
      answer.classList.add('err');
      const msg = err instanceof TypeError ? "The chat can't be reached right now." : err.message;
      answer.replaceChildren(el('p', '', msg));
    } finally {
      busy = false;
      answer.removeAttribute('aria-busy');
      sync();
      turn.scrollIntoView({ block: 'end', behavior: smooth });
    }
  }

  input.addEventListener('input', sync);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const question = input.value.trim().slice(0, 500);
    if (!question || busy) return;
    input.value = '';
    ask(question);
    sync();
    input.focus();
  });

  const suggest = document.getElementById('suggest');
  SUGGESTED.forEach(q => {
    const b = el('button', 'chip', q);
    b.type = 'button';
    b.addEventListener('click', () => { if (!busy) ask(q); });
    suggest.append(b);
  });

  sync();
  if (matchMedia('(pointer: fine)').matches) input.focus();
})();
