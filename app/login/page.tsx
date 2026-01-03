'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-gray-600">
          Welcome back to MC Directory
        </p>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-amber-600 hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="h-8 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto mt-2 animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
