import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE_NAME}: what we collect, how advertising cookies work on this site, and how to opt out.`,
};

const UPDATED = 'October 15, 2026';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none text-gray-600">
        <p className="text-sm text-gray-500 mb-8">Last updated: {UPDATED}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Who we are</h2>
        <p>
          {SITE_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website at {SITE_URL}. This policy explains
          what information we collect when you use the site, how we use it, and the choices you have. It applies to the website only.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information we collect</h2>
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Information you give us</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Name and email address when you contact us or submit a club.</li>
          <li>Content you submit, such as club submissions and listing corrections.</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Information collected automatically</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>IP address, browser type, device type, and operating system.</li>
          <li>Pages visited, time on page, and the site that referred you.</li>
          <li>Cookies and similar identifiers set by us and by the third parties listed below.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How we use information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To operate the directory and review submissions.</li>
          <li>To respond to messages and listing corrections.</li>
          <li>To measure traffic and improve the site.</li>
          <li>To show advertising that funds the site.</li>
          <li>To prevent spam, fraud, and abuse.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Advertising and cookies</h2>
        <p>
          We use Google AdSense to show ads. Third-party vendors, including Google, use cookies to serve ads based on your prior
          visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve
          ads to you based on your visit to this site and other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" className="text-amber-600 hover:underline" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>.
          You can opt out of some third-party vendors&apos; use of cookies for personalized advertising at{' '}
          <a href="https://www.aboutads.info/choices" className="text-amber-600 hover:underline" rel="noopener noreferrer" target="_blank">www.aboutads.info</a>.
          Google&apos;s own policies are described at{' '}
          <a href="https://policies.google.com/technologies/ads" className="text-amber-600 hover:underline" rel="noopener noreferrer" target="_blank">How Google uses information from sites that use its services</a>.
        </p>
        <p>
          Visitors in the European Economic Area, the United Kingdom, and Switzerland are shown a consent message before
          personalized ads are served, and can change their choice at any time through that message.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Analytics</h2>
        <p>
          We use Google Analytics to understand how the site is used. Google Analytics sets cookies and collects usage data
          in aggregate. You can prevent this with the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-amber-600 hover:underline" rel="noopener noreferrer" target="_blank">Google Analytics opt-out browser add-on</a>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Affiliate links</h2>
        <p>
          {SITE_NAME} is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to
          provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you click an Amazon
          link on this site, Amazon may set a cookie to attribute a purchase to us. Affiliate links are marked as such.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Club listings and public data</h2>
        <p>
          Club listings contain business-type information that clubs have published, such as a club name, city, website, and
          public phone number. We do not publish the personal contact details of individual members. If a listing contains
          information you want corrected or removed, use the <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Sharing</h2>
        <p>
          We do not sell personal information. We share it only with service providers that host the site, store data, deliver
          email, and serve ads and analytics as described above, and when the law requires it.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Retention and security</h2>
        <p>
          We do not offer user accounts and the website stores no personal data. Form submissions are delivered to our
          inbox by email and kept there for up to two years. We use industry-standard safeguards, but no method of
          transmission or storage is completely secure.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Your rights</h2>
        <p>Depending on where you live, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal information we hold about you.</li>
          <li>Correct inaccurate data.</li>
          <li>Delete information you sent us.</li>
          <li>Opt out of marketing email and of personalized advertising.</li>
        </ul>
        <p>To exercise these rights, use the <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link>.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Children</h2>
        <p>The site is not directed at children under 13, and we do not knowingly collect their information.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Changes</h2>
        <p>We will post any changes on this page and update the date at the top.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact</h2>
        <p>
          Questions about this policy go through our <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
