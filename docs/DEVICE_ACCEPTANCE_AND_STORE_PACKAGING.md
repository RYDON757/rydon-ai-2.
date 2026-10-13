# RYDON AI 2.0 — device acceptance and store packaging plan

This plan separates the current live Progressive Web App (PWA) from native store releases. Completing the checklist below is not the same as having tested devices, built signed packages, or published either store listing.

Live PWA: https://rydon-ai-2.onrender.com/

## 1. Physical-device acceptance test

Run these checks on real devices; desktop emulation is useful but is not a substitute.

### Android (current Chrome)

- [ ] Open the live HTTPS URL in Chrome and wait for the page to finish loading.
- [ ] Confirm the page loads without a certificate warning or broken layout.
- [ ] From Chrome's menu, choose Install app if offered; otherwise use Add to Home screen.
- [ ] Launch from the new home-screen icon. Confirm the app opens at the expected URL and the icon is correct.
- [ ] Check portrait and landscape layouts, on-screen keyboard, scrolling, safe areas, and browser/back navigation.
- [ ] Send a chat message; test refresh and a second conversation.
- [ ] Test microphone permission and speech recognition only if supported by that device/browser; deny permission once and confirm the app remains usable.
- [ ] Upload a small supported document and confirm clear handling of unsupported or oversized files.
- [ ] Test a temporary network loss: the cached shell may open, but AI replies and server features require a connection. Restore the network and verify recovery.
- [ ] Update/reload after a new deployment and confirm the current UI and icons appear.

Record device model, Android version, Chrome version, date, pass/fail, and screenshots for failures.

### iPhone (current Safari)

- [ ] Open the live HTTPS URL in Safari.
- [ ] Use Share → Add to Home Screen, enable Open as Web App if shown, then add it.
- [ ] Launch from the home-screen icon and verify the Apple touch icon and standalone presentation.
- [ ] Check portrait/landscape layout, safe-area insets, keyboard, scrolling, and back/navigation behavior.
- [ ] Test chat, refresh, file upload, and microphone permission where supported.
- [ ] Test network loss and recovery. Do not expect AI replies or server-backed features to work offline.
- [ ] Verify the home-screen app updates after reloading/reopening following a deployment.

Record iPhone model, iOS version, Safari version, date, pass/fail, and screenshots for failures. If no physical iPhone is available, mark these checks NOT TESTED rather than passed.

## 2. Native store packaging decision

### Android — investigate Trusted Web Activity (TWA) first

A TWA can reuse the HTTPS PWA and is the first low-maintenance route to evaluate. Before creating a release:

- [ ] Confirm the PWA meets current Google Play and TWA requirements.
- [ ] Choose an owner-controlled, permanent Android application ID (package name).
- [ ] Create the Android project/build configuration with Bubblewrap or the currently supported equivalent.
- [ ] Publish and verify /.well-known/assetlinks.json for the final package ID and release signing certificate fingerprint.
- [ ] Create and securely back up the signing key; never commit it to GitHub.
- [ ] Generate a signed Android App Bundle (AAB), test it on physical devices and through Play Console internal testing, and capture test evidence.
- [ ] Prepare listing artwork, screenshots, content rating, privacy disclosures, support contact, and store text.

Do not choose the final package ID or signing identity without the app owner's confirmation; both are important long-term identifiers.

### iOS — evaluate a compliant native implementation

A thin web-view wrapper is not guaranteed App Store approval. Before committing to an implementation:

- [ ] Review current Apple App Review Guidelines and confirm the proposed app offers sufficient app-specific value.
- [ ] Select an owner-controlled bundle identifier and supported native approach (for example, a Capacitor-based iOS project or a purpose-built Swift app).
- [ ] Test the app on physical iPhones, including navigation, uploads, microphone permissions, voice playback, offline/network errors, and privacy flows.
- [ ] Configure Xcode signing and provisioning under the owner's Apple Developer account.
- [ ] Build and validate an archive in Xcode; distribute through TestFlight before requesting public review.
- [ ] Prepare screenshots, privacy nutrition details, support URL, review notes, and any required account deletion flow.

A macOS machine with a supported Xcode version and Apple Developer account is needed for the standard iOS archive/signing workflow. Do not store certificates, provisioning profiles, or credentials in the repository.

## 3. Release blockers to resolve before public store launch

- [ ] Confirm the privacy policy and support contact are published and accurate.
- [ ] Review account/data deletion and all data collection disclosures against actual behavior.
- [ ] Verify persistent data storage: ephemeral local SQLite on the hosting filesystem can be lost during redeploys.
- [ ] Verify AI provider configuration, usage limits, rate limiting, and error handling.
- [ ] Verify billing/subscription claims and entitlements before presenting any paid plans.
- [ ] Keep CI green; review each code change in a pull request and deploy only after required checks pass.
- [ ] Confirm Render deployment and health endpoint after any approved production change.

## Current status

The website and PWA assets are in place, and automated repository checks cover manifest metadata and icon assets. Physical Android/iPhone acceptance testing, signed Android/iOS builds, store account configuration, and store submission remain outstanding until completed and evidenced.
