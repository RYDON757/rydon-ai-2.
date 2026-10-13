# RYDON AI 2.0 — Website Edition

A responsive browser-based RYDON AI assistant with chat history, per-browser profile memory, and browser voice features. It can use either a hosted OpenAI-compatible model API (recommended for public deployment) or local Ollama for local development.

## Deploy publicly with Render

1. Create a GitHub account if you do not already have one.
2. Create a **new private repository** on GitHub named `rydon-ai-2` and upload the contents of this folder (not the ZIP itself). Do not commit API keys or passwords.
3. Create an account at [Render](https://render.com/), choose **New + → Blueprint**, and connect your GitHub repository. Render will read `render.yaml`.
4. In the service's Environment settings, set `RYDON_API_KEY` to an API key from your chosen compatible provider. The included defaults are for Groq: `RYDON_API_BASE=https://api.groq.com/openai/v1` and `RYDON_MODEL=llama-3.3-70b-versatile`. Check the provider's current model list and pricing/limits before use. Never put the API key in `static/app.js`, HTML, or a public repository.
5. Deploy. When the build completes, Render gives you a public HTTPS URL you can open on your phone and share with other people.

The included Render setup generates `RYDON_SECRET_KEY` automatically. Keep it secret. If you choose a different OpenAI-compatible provider, change `RYDON_API_BASE` and `RYDON_MODEL` to the values in that provider's documentation.

## Run locally on Windows

1. Install Python 3.10+ from https://www.python.org/downloads/.
2. For local AI, install Ollama from https://ollama.com/download and run `ollama pull qwen2.5:3b`.
3. Double-click `start_windows.bat`, then open http://127.0.0.1:5000.

If `RYDON_API_KEY` is set, the app uses the hosted API; otherwise it uses local Ollama.

## Install RYDON AI on Windows

The hosted website can be installed as an app shortcut without installing Python:

1. Open https://rydon-ai-2.onrender.com/ in Microsoft Edge or Chrome.
2. In Edge, open the **…** menu → **Apps** → **Install this site as an app** (the wording can vary by version). In Chrome, open the **⋮** menu and look for **Cast, save, and share** or **Save and share** → **Install page as app**.
3. Confirm **Install**. RYDON AI should then open in its own app window. Pin it to the taskbar or Start menu, or create a desktop shortcut if the browser offers that option.

This uses the online version; your computer needs an internet connection for AI replies. The app shell may open offline, but chat, voice recognition and server features need the site/server connection. The first install option appears only after the site loads over HTTPS and the browser recognises its app manifest.

## Copyright and ownership records

The app displays a copyright notice and includes `COPYRIGHT.txt` and `docs/OWNERSHIP_AND_COPYRIGHT.md`. These are project records, not official government registration papers. For a formal filing, use the legal name of the actual owner/author, accurate dates, and disclose third-party components or collaborators as required. GitHub history and Render deployment records can help preserve evidence of development.

## Features

- Responsive browser UI and chat history in browser local storage.
- Per-browser signed session memory for the user's name; different visitors do not share a global name.
- Hosted model API support via `RYDON_API_KEY`, `RYDON_API_BASE`, and `RYDON_MODEL`.
- Local Ollama support for development.
- Browser speech-to-text where supported and text-to-speech for replies. Speech recognition generally requires HTTPS or localhost and browser permission.
- Built-in date/time/joke/name replies and a safe arithmetic parser.
- `/health` endpoint for deployment health checks.

## Important limits and privacy

- Public hosting does not automatically provide free AI inference. A provider API key and available quota are needed for hosted AI replies. Provider usage may cost money; review current pricing and limits.
- Profile memory is stored in a signed browser session cookie, not a cloud database. Chat history stays in the visitor's browser local storage. Clearing browser data clears that history.
- This starter has no user accounts or shared cloud conversation database. Do not treat it as a medical, financial, or other high-stakes service.
- The hosting platform may sleep on a free tier and take time to wake. Check the host's current plan limits.
- Use a strong secret key in production and keep API keys only in the hosting provider's environment settings.


## Embed RYDON AI on another website

### Option A: JavaScript snippet (quickest)

Paste this snippet into the HTML where you want the chat to appear. It loads the hosted RYDON chat inside a responsive iframe; your website never receives the AI provider API key.

```html
<script
  src="https://rydon-ai-2.onrender.com/static/rydon-widget.js"
  data-height="560"
  defer>
</script>
```

You can change `data-height` to a number between 320 and 900 to adjust the widget height.

### Option B: iframe

You can also add the chat directly to a site that allows iframes. Replace the dimensions to fit your page:

```html
<iframe
  src="https://rydon-ai-2.onrender.com/embed"
  title="Chat with RYDON AI 2.0"
  width="100%"
  height="560"
  style="border:0;border-radius:14px;max-width:480px"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="microphone">
</iframe>
```

The embedded panel uses the same hosted chat API as the main site, so the AI provider must be configured on Render. The iframe is served from RYDON AI's domain; it does not give the host website access to the user's chat content. For public production use, monitor API usage and add rate limiting/abuse protection before sharing widely. Embedding may be restricted by the other website's own security policy.
