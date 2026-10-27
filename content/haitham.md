# Haitham: multi-agent academic presentation generator

Haitham (2026) generates academic presentations with a multi-agent pipeline.

- Front end: Next.js with TypeScript and Tailwind CSS.
- Back end: FastAPI in Python, with CrewAI agents.
- Slides are rendered through LaTeX; the Docker image bundles a LaTeX install.
- The model for each agent is configurable, using Anthropic (Claude), Google (Gemini) or OpenAI models.

Live: https://haitham-mu.vercel.app
Code: https://github.com/LimCharles/haitham
