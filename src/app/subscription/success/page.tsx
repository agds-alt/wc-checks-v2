'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Your subscription has been activated. You now have access to all premium features!
        </p>

        {/* Features List */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What&apos;s included:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Increased location limits</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Advanced analytics</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Extended data retention</span>
            </li>
          </ul>
        </div>

        {/* Redirect Info */}
        <p className="text-sm text-gray-500 mb-4">
          Redirecting to dashboard in {countdown} seconds...
        </p>

        {/* Manual Redirect Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
