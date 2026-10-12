# RYDON AI 2.0 — deployment checklist

## Before publishing
- Upload the **contents** of `rydon_web/` to a new private GitHub repository named `rydon-ai-2`.
- Keep `.gitignore` enabled. Never commit API keys, passwords, or a `.env` file.
- Confirm the repository root contains `app.py`, `render.yaml`, `requirements.txt`, `Procfile`, `templates/`, and `static/`.

## Deploy with Render
1. Sign in to Render and connect your GitHub account.
2. Choose **New + → Blueprint** and select `rydon-ai-2`.
3. Review the service settings loaded from `render.yaml` and create/deploy the service.
4. In the Render service environment settings, set `RYDON_API_KEY` to a key from your chosen OpenAI-compatible provider. Do not paste it into source files or GitHub.
5. Confirm `RYDON_API_BASE` and `RYDON_MODEL` match that provider's current API documentation and available models. The current defaults in `render.yaml` are Groq's OpenAI-compatible endpoint and `llama-3.3-70b-versatile`; verify availability before relying on them.
6. Wait for a successful deploy, then open the public `https://...onrender.com` URL.

## Smoke tests after deployment
- Open `/health`; expected JSON: `{"ok": true}`.
- Open the home page and send `hello`.
- Send `my name is Ipolite`, then `what is my name`.
- Ask a normal question that requires the hosted model. If it fails, check the Render logs, `RYDON_API_KEY`, provider quota, base URL, and model name.
- Test voice input in a supported browser with microphone permission and test spoken replies with the voice toggle.
- Check that the browser shows HTTPS and that no API key appears in page source or browser network payloads.

## Notes
- Chat history is kept in that browser's local storage. Profile memory is a signed session cookie, not a shared cloud database.
- Voice recognition support depends on the browser and microphone permission.
- A free hosting plan may sleep when idle. Hosted AI API usage may have separate costs or limits.
