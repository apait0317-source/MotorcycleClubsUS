'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { correctionPrefill } from '@/lib/contact';

function ContactForm() {
  const params = useSearchParams();
  const club = params.get('club');
  const slug = params.get('slug');
  const prefill = club && slug ? correctionPrefill(club, slug) : null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          website: formData.get('website'),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent</h3>
        <p className="text-green-700">Thanks. Messages go straight to the site owner and are read in the next working session.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-green-600 hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {status === 'error' && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          defaultValue={prefill?.subject ?? ''}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="What is this about?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          id="message"
          name="message"
          rows={prefill ? 8 : 5}
          required
          maxLength={5000}
          defaultValue={prefill?.message ?? ''}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Your message..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-xl text-gray-600 mb-8">
        Corrections, removals, questions, and feedback. Every message reaches the site owner by email.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Suspense fallback={<div className="h-96 bg-gray-50 rounded-xl animate-pulse" />}>
            <ContactForm />
          </Suspense>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fixing a listing</h3>
            <p className="text-gray-600">
              Every club page has a <strong>Suggest a correction</strong> link that opens this form with the club name
              and page filled in. Tell us what changed and, if you can, point to the club&apos;s own website or social page
              so we can confirm it.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Adding a club</h3>
            <p className="text-gray-600 mb-4">
              Know a club that is not listed? Use the submission form so the entry arrives with the fields we need.
            </p>
            <Link href="/submit" className="text-amber-600 hover:underline font-medium">
              Submit a club &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
