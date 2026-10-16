import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/terms' },
  title: 'Terms of Service',
  description: `Terms of Service for ${SITE_NAME}. Read our terms and conditions for using our website.`,
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none text-gray-600">
        <p className="text-sm text-gray-500 mb-8">Last updated: October 15, 2026</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using {SITE_NAME} ({SITE_URL}), you accept and agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not use our website.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
        <p>
          {SITE_NAME} is an online directory of motorcycle clubs in the United States. We provide
          information about clubs, including locations, contact details, and public ratings. Our
          service is provided &quot;as is&quot; without warranties of any kind.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Submissions</h2>
        <p>The site has no user accounts. When you send a message, correction, or club submission, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate and complete information</li>
          <li>Submit only clubs and details you are entitled to share</li>
          <li>Accept that submissions are reviewed before publication and may be edited or declined</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Content</h2>
        <p>
          When you submit content (club information, corrections, messages), you grant us a non-exclusive,
          royalty-free license to use, display, and distribute that content. You represent that
          you have the right to submit such content and that it does not violate any laws or
          third-party rights.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Prohibited Activities</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Post false, misleading, or defamatory content</li>
          <li>Harass, abuse, or threaten other users</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use automated tools to scrape or collect data</li>
          <li>Post spam or commercial advertisements</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Club Listings</h2>
        <p>
          Club information on our website is provided for informational purposes only. We do not
          endorse any specific club and are not responsible for the accuracy of listing information.
          Club officers may request corrections or removal through the contact form. We verify requests
          against the club&apos;s own published information before changing a listing.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
        <p>
          All content on our website, including text, graphics, logos, and software, is the property
          of {SITE_NAME} or its content suppliers and is protected by copyright and intellectual
          property laws.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Disclaimer of Warranties</h2>
        <p>
          Our website is provided &quot;as is&quot; without any warranties, express or implied. We do not
          guarantee that our service will be uninterrupted, secure, or error-free.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE_NAME} shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of our
          website.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of our website
          after changes constitutes acceptance of the modified terms.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact</h2>
        <p>
          For questions about these Terms of Service, please visit our
          <a href="/contact" className="text-amber-600 hover:underline"> contact page</a>.
        </p>
      </div>
    </div>
  );
}
