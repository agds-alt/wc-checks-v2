'use client';

import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft } from 'lucide-react';

export default function SubscriptionPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Pending Icon */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Pending
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Your payment is being processed. This usually takes a few minutes.
          We&apos;ll notify you once it&apos;s confirmed.
        </p>

        {/* Info Box */}
        <div className="bg-yellow-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next:</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <span>Bank processes your payment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <span>You&apos;ll receive an email confirmation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <span>Subscription activates automatically</span>
            </li>
          </ul>
        </div>

        {/* Estimated Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Estimated processing time:</strong> 1-24 hours
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Support Link */}
        <p className="text-sm text-gray-500 mt-6">
          Questions?{' '}
          <a href="mailto:support@wchecks.com" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
