'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Check, Zap, Loader2, TrendingUp, Users, MapPin, BarChart3, ArrowRight, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const { data: plans, isLoading } = trpc.subscription.getPlans.useQuery();
  const { data: currentPlan } = trpc.subscription.getCurrentPlan.useQuery();
  const createSubscription = trpc.subscription.createSubscription.useMutation();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handleSelectPlan = async (planId: string, planSlug: string) => {
    // Free plan - just redirect to register
    if (planSlug === 'free') {
      router.push('/register');
      return;
    }

    // Enterprise plan - contact sales
    if (planSlug === 'enterprise') {
      window.location.href = 'mailto:sales@wchecks.com?subject=Enterprise Plan Inquiry';
      return;
    }

    // Paid plans - initiate payment
    try {
      const result = await createSubscription.mutateAsync({
        planId,
        billingCycle,
      });

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const allPlans = plans || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12 bg-white p-1.5 rounded-2xl shadow-lg w-fit mx-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {allPlans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isPopular = plan.slug === 'basic';
            const isFree = plan.slug === 'free';
            const isEnterprise = plan.slug === 'enterprise';

            const monthlyPrice = isFree || isEnterprise
              ? null
              : billingCycle === 'yearly'
              ? (plan.price_yearly / 100000 / 12)
              : (plan.price_monthly / 100000);

            const totalPrice = isFree || isEnterprise
              ? null
              : billingCycle === 'yearly'
              ? (plan.price_yearly / 100000)
              : (plan.price_monthly / 100000);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 ${
                  isPopular ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className={`p-8 ${isPopular ? 'pt-16' : ''}`}>
                  {/* Plan Name & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    {isFree && <Shield className="w-8 h-8 text-green-500" />}
                    {isPopular && <Zap className="w-8 h-8 text-blue-500" />}
                    {plan.slug === 'pro' && <TrendingUp className="w-8 h-8 text-purple-500" />}
                    {isEnterprise && <Users className="w-8 h-8 text-indigo-500" />}
                  </div>

                  <p className="text-gray-600 text-sm mb-6 h-10">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    {isFree ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-gray-900">Free</span>
                      </div>
                    ) : isEnterprise ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-gray-900">Custom</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg text-gray-600">Rp</span>
                          <span className="text-5xl font-bold text-gray-900">
                            {monthlyPrice?.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-gray-600">/mo</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-sm text-gray-500 mt-2">
                            Billed Rp {totalPrice?.toLocaleString('id-ID')} yearly
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Key Limits */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Locations</p>
                        <p className="font-bold text-gray-900">
                          {plan.max_locations === -1 ? 'Unlimited' : plan.max_locations}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Team Members</p>
                        <p className="font-bold text-gray-900">
                          {plan.max_users === -1 ? 'Unlimited' : plan.max_users}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Inspections/Month</p>
                        <p className="font-bold text-gray-900">
                          {plan.max_inspections_per_month
                            ? plan.max_inspections_per_month.toLocaleString()
                            : 'Unlimited'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {(plan.features as string[]).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id, plan.slug)}
                    disabled={isCurrentPlan || createSubscription.isLoading}
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : isFree
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {createSubscription.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : isFree ? (
                      <>
                        <span>Start Free</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : isEnterprise ? (
                      <>
                        <span>Contact Sales</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <span>Get Started</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept credit cards, bank transfers, e-wallets, and more via Midtrans payment gateway.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Our Free plan is available forever with 5 locations. No credit card required!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel anytime from your dashboard. Your plan remains active until the end of the billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Trusted by businesses across Indonesia
          </p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="text-xs">🔒 Secure Payment</div>
            <div className="text-xs">✓ 24/7 Support</div>
            <div className="text-xs">💯 Money-back Guarantee</div>
          </div>
        </div>
      </div>
    </div>
  );
}
