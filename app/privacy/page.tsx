import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none text-gray-600">
        <p className="text-sm text-gray-500 mb-8">Last updated: December 2024</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to {SITE_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your
          privacy and personal information. This Privacy Policy explains how we collect, use, and
          safeguard your information when you visit our website at {SITE_URL}.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
        <p>When you create an account or contact us, we may collect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Name and email address</li>
          <li>Account credentials</li>
          <li>Profile information you choose to provide</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Automatically Collected Information</h3>
        <p>When you visit our website, we may automatically collect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>IP address and browser type</li>
          <li>Device information</li>
          <li>Pages visited and time spent on site</li>
          <li>Referring website</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide and maintain our services</li>
          <li>Process your account registration</li>
          <li>Respond to your inquiries</li>
          <li>Send you updates and marketing communications (with your consent)</li>
          <li>Improve our website and user experience</li>
          <li>Protect against fraud and abuse</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience on our website.
          Cookies help us remember your preferences and understand how you use our site. You can
          control cookie settings through your browser preferences.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Third-Party Services</h2>
        <p>We may use third-party services that collect information, including:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Google Analytics for website analytics</li>
          <li>Google AdSense for advertising</li>
          <li>Payment processors for transactions</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However,
          no method of transmission over the internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us through our
          <a href="/contact" className="text-amber-600 hover:underline"> contact page</a>.
        </p>
      </div>
    </div>
  );
}
