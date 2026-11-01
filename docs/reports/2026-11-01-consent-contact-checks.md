# Consent, contact, and account checks, November 1, 2026

## Status

Code-level consent initialization and contact acknowledgement fixes are implemented on the provided work branch. Production configuration, account-side settings, inbox delivery, and deployment remain blocked by missing account access and an unconfirmed destination inbox. No account setting, production environment variable, or deployment was changed. No live email was sent.

## Confirmed code issues and corrections

### Analytics consent initialization

The previous Google Analytics snippet sent `js` and `config` commands without setting a default consent state. The new initialization in `lib/consent.ts` queues denied `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` for EEA country codes, the UK, and Switzerland before measurement configuration. The initialization script is scheduled before loading the measurement library. It preserves an existing data layer and CMP commands and does not fabricate a consent grant.

Defaults are scoped to the countries where Google's European regulations message applies, following Google's recommendation to preserve the existing measurement behavior elsewhere. The asynchronous CMP has a 500 ms update window. Denied storage in advanced consent mode can still permit cookieless measurement pings; it does not mean all requests are blocked.

This is Analytics/Google-tag initialization. AdSense's certified CMP publication and advertising consent still require the actual AdSense account. Google states that its CMP updates consent mode only for visitors shown its European regulations message. Both advertising and analytics consent-mode options must be enabled in that account for the existing message to provide the corresponding updates. These settings apply across the account's configured European regulations messages, so their scope must be checked before any account change.

### Contact configuration and acknowledgement

The previous email sender could return an empty message ID from a successful HTTP response, allowing the contact route to acknowledge a message that the provider had not acknowledged. The sender now requires a nonempty string message ID. Missing, malformed, numeric, or blank IDs fail; the route returns its generic failure response instead of claiming success.

Configuration values are trimmed. A blank API-key binding, blank/malformed destination inbox, or malformed sender is rejected before a provider request. Error messages name the configuration key without printing its value. Existing valid display-name senders and the documented onboarding sender fallback remain supported. The onboarding sender is still limited by Resend's account restrictions; format validation does not prove domain verification or delivery.

## Checks performed

- Regression tests were run before changes: missing consent defaults, script order, configuration normalization/validation, and missing provider acknowledgement produced the expected failures; they passed after the corrections.
- The public production contact endpoint returned HTTP 400 and `All fields are required` for an empty JSON payload. Validation rejected it before the email path. This confirms route/input-validation behavior only, not production credentials or inbox delivery.
- A fresh homepage scrape requested a German visitor context and returned HTTP 200. The interactive browser audit failed to initialize and then timed out, so no regional consent, cookie, or choice-update result is claimed.
- An isolated native Chromium check failed because that profile did not trust the execution environment's HTTPS interception CA. TLS verification was kept enabled. This is a tool-environment limit, not evidence that the public site's certificate is broken. The task-owned browser was closed.
- No consent choice, ad, valid contact form, private dashboard, or email was submitted during these checks.

Final application verification passed on the changed tree using Node 22/pnpm 10: **163 tests**, typecheck, application lint, and the production build generating **3,433 pages**. The seven additional regressions exercise actual initialization commands/order, retained CMP commands, configuration failures/normalization, provider acknowledgement, and the contact route's success/failure boundary. The local build does not supply private production account settings; these results do not establish regional consent operation or email delivery.

## Account access and input blockers

1. **Vercel:** a relevant integration was discovered and suggested. Its latest confirmed state is not installed; no Vercel account tools or configured outbound identity are available. Project environment variables, sender/inbox values, ad unit IDs, and the existing contact-route firewall rule were not read or changed.
2. **Contact inbox:** the destination address has not been supplied or confirmed. A text question is pending for the inbox and permission to send one clearly labeled test email after configuration. An arbitrary personal address was not inferred from another connected account.
3. **Resend:** no direct connected account tool or runtime credential is available. API-key authorization, sender-domain verification, acceptance and delivery cannot be established from format/unit tests.
4. **AdSense:** no direct account connector or authenticated dashboard session is available. Certified message publication, the advertising/analytics consent-mode toggles, US state privacy messaging, Auto ads exclusions, ad-unit configuration, and the site's actual approval/policy status remain unverified. A public publisher ID or ads.txt file does not prove those settings.
5. **Release:** the existing authorization retains source changes on the work branch. No push, merge, production deployment, or private-account change was inferred from automatic goal continuation.

## Exact account steps once access is available

- In Vercel, inspect the selected project's environment-variable names and readiness without decrypting secret values. Set the confirmed `CONTACT_TO_EMAIL`, preserve the Resend key, and use a verified sender or the permitted onboarding recipient arrangement. Check the two ad-unit IDs and the documented POST `/api/contact` rate limit. Apply any production settings through a separately authorized release.
- In Resend, verify the sender domain and account authorization. After explicit destination/test authorization, send one labeled contact/submission test and verify arrival, Reply-To, and error behavior. A provider ID proves acceptance, not arrival.
- In AdSense, open **Privacy & messaging → European regulations → Settings**. Check the scope, enable **Consent mode for advertising purposes** and **Consent mode for analytics purposes** as appropriate, save, and verify the published message on the intended site. Check US state messaging and privacy-choice controls separately.
- In a verified EEA/UK/Swiss fresh browser session, inspect defaults before any choice and consent/storage updates after reject, accept and revocation. Check outside-region behavior separately. Verify the Auto ads exclusions, ads.txt dashboard status, actual ad units, and policy/approval status.

## Official references

- Google, consent defaults, update order, regional behavior and asynchronous CMP timing: https://developers.google.com/tag-platform/security/guides/consent
- Google AdSense, advertising and analytics consent-mode account settings: https://support.google.com/adsense/answer/16053245?hl=en
- Google AdSense, European regulations messages and the geographic scope of CMP updates: https://support.google.com/adsense/answer/10961068?hl=en

Research and red/green verification artifacts are retained in `/workspace/work/consent-contact/`. They contain no printed credential values or cookie values.
