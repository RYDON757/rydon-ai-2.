# RYDON AI 2.0 — Android installation troubleshooting

This guide applies to the hosted Progressive Web App (PWA). It does not mean that a native Android package or Google Play release exists.

## Before trying to install

1. Open the production site in current Google Chrome on Android: https://rydon-ai-2.onrender.com/
2. Confirm the page loads normally over HTTPS and wait for it to finish loading.
3. Update Chrome if an update is available.
4. Confirm the phone has a working internet connection. The AI and account APIs still need the server even when an app shortcut is installed.

## If Chrome offers only “Add to Home screen”

1. Open the site directly in Chrome, not inside WhatsApp, Facebook, or another in-app browser.
2. Open Chrome's three-dot menu and choose **Install app** if it appears.
3. If only **Add to Home screen** appears, use it as a temporary shortcut. This is useful, but it is not proof that Chrome accepted the site as an installable PWA.
4. Close the tab, reopen Chrome, and try again after the site has fully loaded.
5. If the install dialog stays on **Installing**, cancel it, restart Chrome, and try once more. Do not repeatedly tap Install or clear all browser data as a first step.

Menu wording and PWA installation support can vary by Android and Chrome version.

## If installation still fails

Collect these details before changing the production app:

- Android version and phone model.
- Chrome version (Chrome menu → Settings → About Chrome).
- Whether the menu says **Install app** or only **Add to Home screen**.
- Whether installation fails immediately or remains stuck on **Installing**.
- Whether the production page and its icons load without errors.

If you have access to a desktop computer, open the site in Chrome and inspect **DevTools → Application** for the manifest and service worker, and **DevTools → Console** for installability errors. Check the manifest response at `/static/manifest.webmanifest` and service worker response at `/static/service-worker.js`. Do not share API keys, cookies, authorization headers, or other secrets in screenshots or logs.

## Important release distinction

- **Add to Home screen:** a browser shortcut.
- **Install app:** Chrome installs the PWA experience when the site meets the browser's current requirements.
- **Google Play / Apple App Store:** a separate publishing process requiring store assets, policy compliance, testing, and a suitable app package or wrapper. A working PWA alone does not complete either store release.

## Production safety

Do not change the manifest, service worker caching rules, or deployment settings blindly to force the install prompt. Verify the live manifest, icon URLs, service worker registration, and browser console first. Keep API routes out of the offline cache; account, billing, and AI requests must not be served from stale cached responses.
