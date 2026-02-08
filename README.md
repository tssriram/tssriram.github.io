# Tharun Sriram — Portfolio & Tharun-bot

Personal portfolio site and chat interface for **Tharun Sriram** (Senior AI/ML Scientist @ Vanguard). The site is static (HTML/CSS/JS), hosted on GitHub Pages, and includes **Tharun-bot**, a chat UI backed by a locally hosted LLM.

## What’s in this repo

- **`index.html`** — Main portfolio: hero, About (bullets + Technical Skills + Tech Stack), Featured Projects, Contact, and a CTA to open the chat.
- **`chat.html`** — Tharun-bot chat page: message list, input, send, clear-chat, and a short description of the backend.
- **`assets/`**
  - **`css/main.css`** — Global styles (nav, hero, sections, buttons, project cards, footer).
  - **`css/chat.css`** — Chat-only styles (header, messages, input, typing indicator, clear button).
  - **`js/main.js`** — Shared behavior: mobile hamburger menu, smooth scroll for anchor links, optional section visibility (plus legacy template code).
  - **`js/chat.js`** — Chat logic: send messages, show typing state, render bot replies, basic markdown-style formatting, and persist/clear history in `localStorage`. Calls the backend API with the full conversation history.
- **`images/`** — Favicon, profile photo, and project screenshots.

Navigation is link-only (no site title): Home, Tharun-bot, About, Projects, Contact. The chat is reachable from the nav and from the hero “Talk to AI Tharun” button.

## Tharun-bot & backend

The chat UI is **only the front end**. The backend is **not** in this repo.

- **Backend:** A locally hosted LLM — **Qwen 14B Instruct** — running fully on an **M4 Mac mini** via **Ollama**.
- **Exposure:** The Ollama (or custom API) endpoint is exposed to the internet through a **Cloudflare Tunnel**, so the static site (e.g. on GitHub Pages) can POST to it from the browser.

The front end in `assets/js/chat.js` is configured to call a single API endpoint (currently a Cloudflare Worker URL that forwards to your tunnel). It sends:

- **Request:** `POST` with JSON body `{ "messages": [ { "role": "user"|"assistant", "content": "..." } ] }`.
- **Response:** JSON with the model reply in one of: `response`, `message`, or `content`.

So the “API” the chat is connected to is: **Qwen 14B Instruct on Ollama (M4 Mac mini) → Cloudflare Tunnel (and optionally a Worker)**.

## Running / deploying

- **Local:** Open `index.html` and `chat.html` in a browser, or serve the repo with any static server (e.g. `python -m http.server` or `npx serve`). Chat will work only if the API endpoint in `chat.js` is reachable from your machine.
- **Production:** The repo is set up for **GitHub Pages** (e.g. `https://tssriram.github.io`). Push to the usual branch; no build step.

## Tech stack (site)

- Plain **HTML**, **CSS**, **JavaScript** (no framework).
- **Font Awesome** (icons), **Google Fonts** (Poppins).
- Chat history stored in browser **localStorage**; cleared with “Clear chat.”

## License

Use and reuse as you like (e.g. for personal/portfolio). Resume and content are personal.
