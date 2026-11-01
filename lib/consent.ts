// The owner uses Google's banner worldwide and permits cookieless measurement.
// Advanced Consent Mode loads the tag with denied defaults in every country;
// only the configured CMP supplies the visitor's consent updates. Account-side
// advertising AND analytics consent-mode settings must be enabled. This code
// does not publish a CMP message or grant consent.

export function googleAnalyticsInitialization(measurementId: string): string {
  const defaults = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
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
