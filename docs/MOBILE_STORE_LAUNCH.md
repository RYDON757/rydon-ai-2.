# RYDON AI 2.0 — Mobile store launch checklist

This project currently ships as a Progressive Web App (PWA). A live website and a web app manifest do **not** by themselves mean that Android or iOS store packages are ready or published.

## Checks automated in this repository

- Python source compilation.
- Existing Flask/API regression tests.
- Manifest JSON parsing and required PWA metadata.
- Verification that every icon URL declared in the manifest responds successfully.
- Service-worker asset availability and an assertion that API requests are excluded from the app-shell cache.

These checks run on pull requests and pushes to `main`. A green workflow is required before merging a change that affects launch readiness.

## Remaining Android release work

- Decide and document the packaging route (for example, a Trusted Web Activity / Bubblewrap wrapper, if its requirements fit the product).
- Provide and verify Android launcher/store artwork in the required raster sizes, including 192×192 and 512×512 PNG assets where required by the chosen packaging route. The current manifest references an SVG, so Android packaging requirements must be checked rather than assumed satisfied.
- Configure package ID, signing key, app links / Digital Asset Links, privacy policy, screenshots, content rating, and Play Console listing.
- Build and test a signed release on real Android devices and internal testing tracks.

## Remaining Apple release work

- Choose a supported iOS packaging approach and verify that it complies with current App Store Review Guidelines; a web wrapper alone does not guarantee approval.
- Create the iOS project, bundle identifier, app icons, launch assets, signing and provisioning configuration.
- Test navigation, login, uploads, microphone permissions, voice playback, network failures, and account/subscription flows on physical iPhones and supported iOS versions.
- Provide App Store screenshots, privacy disclosures, support contact, and review notes; verify all required Apple developer account setup.

## Production gates before public launch

- Confirm CI is green and review the pull request before merging.
- Confirm the Render build and deployment succeed and the live `/health` endpoint returns HTTP 200.
- Verify account data persistence before accepting real users. The current README notes that default SQLite storage on an ephemeral Render filesystem can be lost during redeploys; configure durable storage before production use.
- Verify payment provider keys, webhook signatures, subscription entitlements, privacy policy, data deletion, rate limiting, and monitoring before advertising paid plans.
- Never commit signing keys, API keys, webhook secrets, or user data.

## Status

This checklist is a launch gate, not a statement that the apps have been submitted or approved. Store submission should begin only after the corresponding build, device tests, privacy review, and store assets are complete.
