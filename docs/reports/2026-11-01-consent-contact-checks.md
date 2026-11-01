# Consent, contact, and account checks, November 1, 2026

## Status

This report records the implementation and contact-test evidence before publication of the reviewed work. The owner subsequently instructed "Publish them", authorizing the reviewed source release. The production deployment and post-release checks must be verified separately; the earlier publication limits described below are historical scope boundaries.

Code-level consent initialization and contact acknowledgement fixes are implemented on the provided work branch. The owner supplied the destination inbox, authorized one labeled delivery test, connected Vercel, approved team access, and approved a redeploy of the current production commit `85c69d0`. Deployment `dpl_Hp1EmkzQ6Rz3SMo5Cu2et8kfBcME` is now READY on the production domains and activates the saved recipient. The authorized test returned HTTP 500: the matching function log records Resend HTTP 403 because the onboarding sender permits testing only to its account owner's address. No test email was accepted. A sender on a Resend-verified domain is required. The reviewed work-branch source changes were not published.

The owner confirmed Google's consent banner worldwide and subsequently explicitly approved Google's cookieless measurement when consent is denied. Both policy choices are resolved. The initializer now applies denied defaults worldwide while retaining advanced Consent Mode. These source changes remain undeployed, and the account's actual banner audience and runtime behavior remain unverified.

The owner has also instructed us to assume permission for existing photos. That removes the request for a separate photo-rights decision from the current work; it is an owner-supplied assumption, not an independent rights audit.

## Confirmed code issues and corrections

### Analytics consent initialization

The previous Google Analytics snippet sent `js` and `config` commands without setting a default consent state. The new initialization in `lib/consent.ts` queues denied `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` worldwide before measurement configuration. The initialization script is scheduled before loading the measurement library. It preserves an existing data layer and CMP commands and does not fabricate a consent grant.

The initial regional proposal was replaced with worldwide defaults after the owner confirmed the banner's audience and advanced-mode policy. Omitting the regional restriction applies denied defaults in all countries. The asynchronous CMP has a 500 ms update window. The tag remains configured while storage is denied, permitting Google's cookieless measurement pings as authorized; this does not mean all requests are blocked.

This is Analytics/Google-tag initialization. AdSense's certified CMP publication and advertising consent still require the actual AdSense account. Google states that its CMP updates consent mode only for visitors shown its European regulations message. Both advertising and analytics consent-mode options must be enabled in that account for the existing message to provide the corresponding updates. These settings apply across the account's configured European regulations messages, so their scope must be checked before any account change.

### Contact configuration and acknowledgement

The previous email sender could return an empty message ID from a successful HTTP response, allowing the contact route to acknowledge a message that the provider had not acknowledged. The sender now requires a nonempty string message ID. Missing, malformed, numeric, or blank IDs fail; the route returns its generic failure response instead of claiming success.

Configuration values are trimmed. A blank API-key binding, blank/malformed destination inbox, or malformed sender is rejected before a provider request. Error messages name the configuration key without printing its value. Existing valid display-name senders and the documented onboarding sender fallback remain supported. The onboarding sender is still limited by Resend's account restrictions; format validation does not prove domain verification or delivery.

## Checks performed

- Regression tests were run before changes: missing consent defaults, script order, configuration normalization/validation, and missing provider acknowledgement produced the expected failures; they passed after the corrections.
- The worldwide-policy regression failed against the regional initializer, then passed after removing its regional restriction. The real component still queues all four denied defaults before Analytics configuration and library loading, retains existing CMP commands, and configures the tag for the authorized cookieless measurement.
- The public production contact endpoint returned HTTP 400 and `All fields are required` for an empty JSON payload. Validation rejected it before the email path. This confirms route/input-validation behavior only, not production credentials or inbox delivery.
- A fresh homepage scrape requested a German visitor context and returned HTTP 200. The interactive browser audit failed to initialize and then timed out, so no regional consent, cookie, or choice-update result is claimed.
- An isolated native Chromium check failed because that profile did not trust the execution environment's HTTPS interception CA. TLS verification was kept enabled. This is a tool-environment limit, not evidence that the public site's certificate is broken. The task-owned browser was closed.
- A later fresh public scrape requested a US visitor context and returned HTTP 200 (scrape `01a198db-62db-772e-8d1d-b381325c5397`). Its live browser inspection did run: no consent dialog, Funding Choices iframe, cookie names, Analytics script, or consent command was observed in that session. The AdSense script element was present. A network follow-up timed out, so script execution, advertising-request blocking by the browser environment, and actual worldwide banner coverage remain unverified. This does not prove that no banner is published. The browser session was stopped successfully.
- After explicit approval, the current production version was redeployed. Both `/` and `/contact` returned HTTP 200 with the new deployment marker and no old marker. Vercel's project metadata and deployment aliases independently matched the new READY deployment and the approved `main` commit `85c69d0ee85f517ce55dffd9c2157a85a69ff867`.
- Exactly one labeled valid contact test was submitted after activation, reference `MCUS-20261101-B1E96E71A6`. The request returned HTTP 500 with the generic send failure. The matching error/function log on that deployment and request records `Resend responded 403` with the testing-recipient restriction and a requirement to verify a sender domain. The provider rejected the message; no delivery is claimed and no retry was sent. No ad was clicked or consent choice submitted.

Final application verification was repeated after the worldwide-policy adjustment using Node 22/pnpm 10: **163 tests**, typecheck, application lint, and the production build generating **3,433 pages** all passed. The seven additional regressions exercise actual initialization commands/order, retained CMP commands, configuration failures/normalization, provider acknowledgement, and the contact route's success/failure boundary. The local build does not supply private production account settings; these results do not establish runtime consent operation or email delivery.

A fresh independent review of the initial bounded changes found no critical or important issue. Its one minor documentation correction was applied: a blank optional sender uses the onboarding fallback, while malformed nonempty senders are rejected. The reviewer also ran the focused consent/email/contact tests successfully. That review predates the subsequent worldwide-policy adjustment described above.

A second focused independent review covered all five files in the worldwide-policy adjustment and found no critical, important, or minor issue. It independently passed the three component tests and `git diff --check`. Live account/browser behavior, email delivery, deployment, and wider-directory review were outside that read-only code review and remain subject to the checks below.

## Account access and input blockers

1. **Vercel:** connection and team access are verified. The project, canonical domains, environment-variable metadata and current production deployment were inspected. The confirmed contact recipient was saved while preserving its existing Production/Preview scopes. No secret was decrypted, printed, or copied to the local environment. The active custom firewall configuration endpoint returned `404 Config not found`, so the documented contact rate limit is not verified.
2. **Contact inbox:** the owner supplied the destination and explicitly authorized a test. The address and test payload are retained in the local work ledger rather than added to public site content. The provider acknowledged the configuration update, and a metadata read confirmed its ID, scopes and update time. The approved redeploy activated the setting. The test was attempted once and rejected by Resend before message acceptance. The existing test-send authorization persists after the sender configuration is repaired; do not ask for it again or send to an alternative inbox.
3. **Resend:** the sensitive `RESEND_API_KEY` binding exists in Production and Preview, and the live request reached Resend; its value was not read. No `CONTACT_FROM_EMAIL` override is configured. The onboarding-sender fallback is the confirmed blocker: Resend returned HTTP 403 because testing emails can go only to the account owner's own address. No Resend Vercel integration or direct Resend connector was found. A text question is pending for a sender address on a Resend-verified domain. Sender verification, message acceptance, inbox delivery and Reply-To remain unverified.
4. **AdSense:** no direct account connector or authenticated dashboard session is available. Certified message publication, the advertising/analytics consent-mode toggles, US state privacy messaging, Auto ads exclusions, ad-unit configuration, and the site's actual approval/policy status remain unverified. A public publisher ID or ads.txt file does not prove those settings.
5. **Release at the contact test:** production was deployment `dpl_Hp1EmkzQ6Rz3SMo5Cu2et8kfBcME`, a separately approved redeploy of `main` commit `85c69d0ee85f517ce55dffd9c2157a85a69ff867`. It predates the reviewed `work` changes. That initial approval covered the exact current-version redeploy to activate contact configuration and send the test. Runtime logs from that deployment showed one observed error, the rejected contact test; the two public health checks passed. Publication of the full reviewed changes was authorized afterward. Other traffic, live-ad layout and worldwide consent behavior were not established by the contact-test checks.

Both responsive ad-slot variables are absent in Production. Publisher and Analytics variable names are present, but their values and actual operation were not inferred from metadata. These findings do not establish AdSense approval, Auto ads configuration, or successful analytics collection.

## Exact account steps once access is available

- In Resend, verify a sending domain and obtain the owner's confirmed sender address on it. In Vercel, save that address as `CONTACT_FROM_EMAIL`, retain the confirmed recipient and existing key, then redeploy the same approved production version for activation and retry the already authorized labeled test. Verify arrival and Reply-To. A provider ID proves acceptance, not arrival. Do not work around the provider restriction by changing the destination to another inbox or by sending through an unrelated mail service.
- Supply the two actual AdSense ad-unit IDs if fixed units are wanted and configure the documented POST `/api/contact` rate limit. Recheck deployment and environment metadata after any authorized release without decrypting secret values.
- In AdSense, open **Privacy & messaging → European regulations → Settings**. Check the scope, enable **Consent mode for advertising purposes** and **Consent mode for analytics purposes** as appropriate, save, and verify the published message on the intended site. Check US state messaging and privacy-choice controls separately.
- In fresh browser sessions inside and outside EEA/UK/Switzerland, verify the worldwide banner audience, defaults before any choice, and consent/storage updates after reject, accept and revocation. Verify the Auto ads exclusions, ads.txt dashboard status, actual ad units, and policy/approval status.

Completion requires runtime evidence against the confirmed policy: pre-choice denial, acceptance, rejection, revocation after acceptance, and persistence after navigation and reload. Record storage reads/writes separately from network requests, and explicitly distinguish cookieless measurement pings from denied storage. Unit tests and country-list accuracy do not replace that verification.

## Official references

- Google, consent defaults, update order, regional behavior and asynchronous CMP timing: https://developers.google.com/tag-platform/security/guides/consent
- Google AdSense, advertising and analytics consent-mode account settings: https://support.google.com/adsense/answer/16053245?hl=en
- Google AdSense, European regulations messages and the geographic scope of CMP updates: https://support.google.com/adsense/answer/10961068?hl=en

Research and red/green verification artifacts are retained in `/workspace/work/consent-contact/`. They contain no printed credential values or cookie values.
