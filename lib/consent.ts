// Google's CMP updates consent only where its European regulations message is
// shown. Scope defaults to those countries so other regions keep their current
// measurement behavior. Account-side advertising AND analytics consent-mode
// settings must be enabled; this code is not a CMP or a consent grant.
const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH',
];

export function googleAnalyticsInitialization(measurementId: string): string {
  const defaults = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    region: CONSENT_REGIONS,
    wait_for_update: 500,
  };
  const id = JSON.stringify(measurementId).replace(/</g, '\\u003c');
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('consent', 'default', ${JSON.stringify(defaults)});
    gtag('js', new Date());
    gtag('config', ${id});
  `;
}
