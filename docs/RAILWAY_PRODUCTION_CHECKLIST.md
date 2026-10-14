# Railway production verification checklist

Use this checklist after a successful Railway deployment. A green deployment confirms the service started; it does not by itself verify account persistence, browser storage, or every workspace tool.

## 1. Confirm the deployed version

1. Open the Railway project and select the `web` service in the `production` environment.
2. Confirm the latest deployment is successful and corresponds to the latest commit on `main`.
3. Open the public Railway domain and verify the home page loads.
4. Open `/health` on that same domain and confirm it returns the app's healthy response.

## 2. Check chat history on desktop

1. Open RYDON in the same browser profile you normally use.
2. Send a short test message and wait for the reply.
3. Refresh the page. Confirm the conversation still appears in **Recent** and can be reopened.
4. Open a new chat, then reopen the earlier chat.
5. Do not clear site data during this test.

**Important:** conversation history currently uses browser `localStorage`. It should persist across refreshes in the same browser profile, but it is not synced to the account or across devices/browsers. Clearing browser site data can remove it.

## 3. Test account creation and login

Use a test account and a unique email address you control. Do not use a reused password.

1. Choose **Log in / Create account** → **Create account**.
2. Submit a name, valid email, and password of at least 10 characters.
3. Confirm the signed-in account is shown.
4. Log out, then log in again with the same credentials.
5. Confirm the account name and email are restored.
6. Optionally try a wrong password and confirm the app rejects it without exposing sensitive details.

### Required persistence check before accepting real users

The current account implementation uses SQLite. On Railway, do not assume the default application filesystem is durable across redeploys or replacement of the running instance.

1. In Railway, add a persistent Volume to the `web` service and mount it at `/data` (or use an already provisioned durable database).
2. Add the service variable `RYDON_DATABASE_PATH=/data/rydon_accounts.sqlite3`.
3. Redeploy and check Railway logs for startup/database errors.
4. Create a **new test account after** the volume is configured.
5. Verify that account can still log in after a later successful redeploy.

Do not delete or replace any existing database while setting this up. If an existing account database must be preserved, back it up and plan a deliberate migration before changing its path. For multi-replica production use, prefer a managed database rather than SQLite on a mounted volume.

## 4. Exercise the workspace sidebar

Open each panel and perform its basic action:

- **Codex:** submit a simple coding question; confirm an answer or a clear provider-configuration error.
- **Schedule:** add a test task, close/reopen the panel, mark it done, and delete it.
- **Library:** save a test note, search for it, export notes, then delete the note.
- **Plugins:** confirm the capability descriptions load. This panel is an information page, not a live third-party plugin marketplace.
- **Recent instructions:** send a test prompt, open this panel, and confirm it appears if chat history is available in that browser.
- **Clear app data:** inspect the options, but do not confirm deletion during routine smoke testing.
- **Settings & tools:** open it and confirm its controls render without errors.

Schedule tasks, library notes, and recent instruction entries are also browser-local unless a future version explicitly adds cloud synchronization. Browser notifications may require permission and may only work while the page is open.

## 5. Check Android layout

1. On the Android phone, open Chrome and visit the Railway public URL.
2. Confirm the page fits the screen without horizontal scrolling.
3. Open and close the hamburger/sidebar; open each workspace panel and close it.
4. Tap the message box, type a short prompt, send it, and confirm the keyboard does not cover the composer or send button.
5. Scroll through a long reply and return to the bottom.
6. Test attachment, voice, and read-aloud only if you grant the relevant browser permissions.
7. If installing the PWA, first verify the normal website works, then test the installed version separately.

## Results log

Record each item as **PASS**, **FAIL**, or **NOT TESTED**, with the browser/device and date. Do not mark an item passed merely because deployment succeeded.

- [ ] Latest Railway deployment and `/health`
- [ ] Chat history survives refresh in the same browser profile
- [ ] Account creation, logout, and login
- [ ] Account remains available after a later redeploy with durable storage configured
- [ ] Codex, Schedule, Library, Plugins, Recent instructions, Clear app data, Settings
- [ ] Android sidebar, layout, scrolling, and composer
