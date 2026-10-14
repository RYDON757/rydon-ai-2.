# Deploy RYDON AI 2.0 on Railway

This guide deploys the existing Flask/PWA app. The Railway configuration is in `railway.json`; creating that file does **not** create a Railway project or deploy the app by itself.

## 1. Create the Railway project

1. Sign in to [Railway](https://railway.com/).
2. Create a new project and choose **Deploy from GitHub repo**.
3. Select `RYDON757/rydon-ai-2.` and deploy the repository's default branch.
4. Confirm Railway detects the repository and uses `railway.json`. The configured start command runs Gunicorn and the health check uses `/health`.

Railway account access and project creation must be completed by the account owner; repository configuration alone cannot do this.

## 2. Configure environment variables

In the Railway service's **Variables** settings, configure:

- `RYDON_SECRET_KEY`: a strong, random secret generated for production. Do not reuse the development fallback or publish this value.
- `RYDON_API_KEY`: API key for the chosen OpenAI-compatible model provider.
- `RYDON_API_BASE`: provider's OpenAI-compatible API base URL. For Groq, the current project default is `https://api.groq.com/openai/v1`.
- `RYDON_HOSTED_MODEL`: a model currently supported by the chosen provider. Verify model availability and pricing with the provider before setting it.

Optional integrations:

- `TAVILY_API_KEY` enables the app's live web-search feature.
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_PRO`, and `STRIPE_WEBHOOK_SECRET` are only for enabling and testing Stripe subscriptions. Keep billing disabled until test-mode checkout, webhook signature validation, subscription updates, and entitlements have been tested.
- `RATELIMIT_STORAGE_URI` can point to a private Redis-compatible service if shared rate-limit counters are required. The default in-memory limiter is per process and resets on restart.

Never commit these values to GitHub or put them in browser JavaScript.

## 3. Check the deployment

After deployment, open the public Railway domain and verify:

1. `/health` returns JSON with `"ok": true`.
2. The home page loads over HTTPS.
3. Sign-up/login, chat, document upload, and voice features work in a browser.
4. Browser DevTools shows no repeated failed API requests.
5. A deliberately invalid or missing model configuration fails gracefully without exposing secrets in the UI or logs.

Do not claim the service is live until the Railway dashboard reports a successful deployment and the public URL has been tested.

## 4. Important production limitations

- **Account persistence:** the app currently uses SQLite at `instance/rydon_accounts.sqlite3` by default. Do not assume this file survives deploys or service replacement. Before real users create accounts, configure a durable database and a production-ready database adapter, or use storage explicitly documented by Railway as persistent and mount it at a configured `RYDON_DATABASE_PATH`.
- **Session secret:** verify the production variable is present without printing its value. Rotate it if it was ever exposed.
- **Privacy:** chat history is stored in each browser's local storage; do not describe it as synced cloud history. Review the data flow and privacy notice before public launch.
- **Costs and quotas:** hosting, model inference, web search, databases, and billing integrations can incur charges. Check each provider's current plan and usage before enabling paid services.

## 5. Keep Render available during migration

The existing Render deployment should not be removed just because Railway configuration exists. Test Railway independently first. Switch the public domain or retire Render only after Railway deployment, health checks, core features, environment variables, and persistence have been verified.
