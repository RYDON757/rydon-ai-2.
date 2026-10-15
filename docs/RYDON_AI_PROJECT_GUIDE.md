# RYDON AI 2.0 — Project Guide

## Project identity

- **Application:** RYDON AI 2.0 (the current browser/PWA title in some places is “Chat IPA”).
- **Source repository:** https://github.com/RYDON757/rydon-ai-2.
- **Render deployment URL:** https://rydon-ai-2.onrender.com/
- **Framework:** Python + Flask, served with Gunicorn.
- **Main entry point:** `app.py`.
- **Main chat interface:** `templates/index.html`.
- **Creative Studio:** `templates/studio.html`.
- **Workspace panels:** `static/workspace.js`.
- **Tests:** `tests/test_app.py`.
- **Render Blueprint:** `render.yaml`.

## Features in the codebase

### Chat and assistant
- Chat interface with saved conversation history in browser local storage.
- Server endpoint `POST /api/chat`, with basic local replies and support for a hosted OpenAI-compatible model.
- Optional web search through a server-side Tavily key.
- Code-assistant mode that sends code questions through the configured chat model.
- Browser speech recognition and text-to-speech support where the browser permits it.
- Text/PDF document upload and text extraction, with a size limit.

### Accounts and security
- Registration, login, logout, and current-account endpoint.
- Passwords stored as salted hashes.
- Password-reset flow uses one-time random tokens, stores token hashes, expires links after 30 minutes, and requires SMTP configuration for email delivery.
- Rate limiting and basic security response headers.
- Password-reset SMTP variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, optional `SMTP_FROM`.
- Production requires `RYDON_SECRET_KEY`; Render Blueprint generates it automatically.

### Workspace
- **Codex:** coding help through the configured AI provider; it does not automatically execute code or modify GitHub.
- **Schedule:** tasks saved in the current browser; browser notifications may work only while the page/browser is active.
- **Library:** local notes with search and export; not cloud-synced storage.
- **Plugins:** describes current capabilities and configuration requirements; it is not a full external plugin marketplace.
- **Recent instructions:** reads prompts from locally saved chats.
- **Clear app data:** lets users delete selected browser-local data. It does not delete server-side account records.

### Creative Studio
- Document drafting through the configured chat model.
- TXT, Markdown, DOCX, and PDF export.
- AI image generation through a separately configured image API.
- A free browser-only SVG poster/graphic generator that does not require an API key or image credits. It creates a designed graphic template, not a photorealistic AI image.
- Photo editing through a separately configured compatible image-editing API.

### PWA and embedding
- Web app manifest and installable browser shell.
- Responsive layouts intended for mobile and desktop.
- `/embed` route and a widget script for embedding the chat in another website.
- `/health` endpoint for hosting health checks.

## Deployment configuration

### Core hosted AI
- `RYDON_API_KEY` (or legacy `GROQ_API_KEY`): secret key for the chosen hosted model provider.
- `RYDON_API_BASE`: OpenAI-compatible API base URL.
- `RYDON_HOSTED_MODEL`: provider-supported model name.
- `TAVILY_API_KEY`: optional key for live web search.

### Image generation/editing
Image generation is separate from the chat-model key and quota. It needs a compatible image endpoint, key, and model in the relevant `RYDON_IMAGE_*` environment variables. If the provider returns an exhausted-credit or quota error, the server cannot replenish credits; the local “Make free graphic” option remains available.

### Password-reset email
Configure the SMTP variables listed above in the hosting dashboard. Do not commit credentials to GitHub or expose them in browser JavaScript.

### Optional subscriptions
Stripe checkout requires `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_PRO`, and `STRIPE_WEBHOOK_SECRET`, plus a correctly configured webhook. Displaying a plan card does not mean payment processing has been enabled.

## Important limitations to understand

- Chat history, saved notes, schedule tasks, and recent instructions are browser-local unless a feature explicitly calls the server. They are not automatically synced between devices.
- Account storage currently uses SQLite. On ephemeral hosting storage, account records may not survive replacement/redeploy unless a persistent disk or managed database is configured.
- Hosted AI and image generation depend on valid provider credentials, model access, quotas, and provider availability.
- Browser reminders are not reliable background jobs and may not fire after the browser/page is closed.
- The Codex panel is an AI coding helper, not a full remote development environment.
- The Plugins panel is not a fully implemented marketplace or arbitrary third-party connector framework.
- PWA installation behavior depends on the browser and device.

## Verification checklist before calling the app production-ready

1. Confirm the latest GitHub commit has deployed to the intended hosting service.
2. Confirm `/health` returns HTTP 200 and `/api/status` identifies the expected model/provider without exposing secrets.
3. Test registration, login, logout, profile persistence, and password reset end-to-end.
4. Configure SMTP and confirm a real reset email arrives.
5. Test chat with a valid provider key and check behavior when provider quota is exhausted.
6. Test document upload and each export format.
7. Test the free SVG graphic path without any image API key.
8. Test mobile navigation, PWA install behavior, and the Clear app data choices.
9. Configure durable database storage before relying on account persistence for real users.
10. Add rate-limit storage and operational monitoring appropriate to the expected public traffic.

## Security rules

- Never commit API keys, SMTP passwords, Stripe secrets, or session secrets.
- Keep provider credentials on the server only.
- Use HTTPS in production.
- Review logs carefully; never log passwords, reset tokens, or private user conversations.
- Do not advertise cloud sync, scheduled background jobs, unlimited AI/image generation, or paid subscription activation until each capability has been implemented, configured, and tested.
