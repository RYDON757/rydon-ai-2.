# RYDON AI 2.0 — Mobile and App Store Launch Checklist

This project is currently a responsive web app/PWA hosted at https://rydon-ai-2.onrender.com/. These steps prepare the project for mobile distribution; they do not mean a native store app has already been built or approved.

## Current PWA status

- [x] HTTPS public origin and responsive viewport metadata.
- [x] Web app manifest and standalone display mode.
- [x] Service worker caches a minimal app shell and does not intercept API requests.
- [x] Existing account/plan and Stripe Checkout scaffolding is present in the web app.
- [ ] Add purpose-built PNG icons (at least 192×192 and 512×512 for Android install surfaces, plus a 180×180 Apple touch icon). Verify maskable safe area and real-device rendering.
- [ ] Test install, update, offline fallback, keyboard/safe-area layout, screen readers, and low-bandwidth behavior on real Android and iOS devices.
- [ ] Confirm privacy policy, terms, support contact, account deletion process, and data-retention disclosures before accepting public users or store review.
- [ ] Set up a durable production database before real accounts/subscriptions are used. The current SQLite-on-ephemeral-filesystem setup is not suitable for durable customer accounts.
- [ ] Complete billing provider configuration, verified purchase events, cancellation/refund handling, and server-side plan entitlements before charging users.

## Google Play and Apple App Store: important distinction

A PWA alone is not a signed native Android/iOS package. To submit to both stores while preserving the web app, choose and configure an approved packaging approach (for example, a maintained Capacitor wrapper or another store-compliant native shell), then build and test the Android and iOS projects. Store policies and review outcomes are determined by Google and Apple, not by this repository.

- Android submission requires a signed Android App Bundle, store listing, screenshots, content rating, privacy/data-safety disclosures, and any applicable testing or account verification.
- iOS submission requires an Apple-compatible build/archive, signing and provisioning, App Store Connect listing, screenshots, privacy details, and review.
- A web-based wrapper must provide a useful app experience and comply with each store's current minimum-functionality, privacy, safety, and billing policies. Do not assume a thin website wrapper will be approved.

## Billing plan

### Website/PWA

The current web billing scaffolding uses Stripe Checkout and a webhook. It is not live until the owner configures Stripe credentials securely in the hosting dashboard, configures the webhook endpoint, tests successful/failed/cancelled payments, and verifies that subscription status is only changed by verified provider events. Do not commit or paste secret keys into GitHub or chat.

Before real billing, also fix production prerequisites: durable user storage, a strong persistent session secret, account recovery/email verification, and correct cancellation management. A user must not be able to downgrade their local plan while leaving a paid recurring subscription charging in the background.

### Native store purchases

For digital features sold inside a native app, assess current Apple and Google billing rules for the distribution regions and product type. Where store billing is required, use the official store billing system and server-side purchase verification; Stripe web checkout alone does not verify App Store or Play purchases. Maintain separate, auditable entitlement handling for web and store transactions and test renewals, grace periods, refunds, revocations, and cancellations.

## Owner-only tasks

Complete these directly in official consoles; never send credentials or financial documents in a chat or commit them to the repository.

1. Create and verify your Apple Developer account and Google Play Console developer account.
2. Enter legal name/entity, identity, contact, tax and payout details directly in each console when requested.
3. Accept the relevant agreements and complete any developer verification or testing requirements shown in the consoles.
4. Create the store listings and subscription products; confirm available countries, currency, tax treatment, price and trial rules before publishing.
5. Keep signing keys, API credentials, bank details and tax documents private. Store server secrets only in the hosting/provider secret settings.

## Release gates

1. Open a pull request and wait for automated tests and review.
2. Do not merge or deploy until checks pass and the owner approves the change.
3. After merge, verify the Render deployment and health endpoint.
4. Test the PWA on physical devices before packaging or submitting it.
5. Submit to each store only after signing, billing, privacy, support, and review requirements are complete.
