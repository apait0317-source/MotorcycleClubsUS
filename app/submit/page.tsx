import { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import SubmitForm from '@/components/SubmitForm';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Submit a Motorcycle Club | ${SITE_NAME}`,
  description: 'Know a motorcycle club that\'s not listed? Help us grow our directory by submitting club information.',
  openGraph: {
    title: `Submit a Motorcycle Club | ${SITE_NAME}`,
    description: 'Help us grow our motorcycle club directory by submitting clubs in your area.',
    url: `${SITE_URL}/submit`,
  },
};

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Submit a Club' },
        ]}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Submit a Motorcycle Club
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Know a club that&apos;s not listed? Help us grow our directory by submitting
          motorcycle clubs in your area. All submissions are reviewed before being added.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <SubmitForm />
      </div>

      {/* Info Section */}
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Quick Review</h3>
          <p className="text-gray-600 text-sm">
            Submissions are reviewed within 24-48 hours to verify information.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Privacy Protected</h3>
          <p className="text-gray-600 text-sm">
            Your email is only used for follow-up and will not be shared publicly.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
          <p className="text-gray-600 text-sm">
            Help fellow riders discover clubs in their area by contributing.
          </p>
        </div>
      </div>
    </div>
  );
}
