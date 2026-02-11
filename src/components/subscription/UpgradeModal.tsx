'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { X, Check, Zap, Loader2, TrendingUp, Users, MapPin, BarChart3 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedPlanId?: string;
}

export function UpgradeModal({ isOpen, onClose, suggestedPlanId }: UpgradeModalProps) {
  const { data: plans, isLoading: plansLoading } = trpc.subscription.getPlans.useQuery(undefined, {
    enabled: isOpen,
  });

  const createSubscription = trpc.subscription.createSubscription.useMutation();

  const [selectedPlanId, setSelectedPlanId] = useState(suggestedPlanId || 'basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handleUpgrade = async () => {
    try {
      const result = await createSubscription.mutateAsync({
        planId: selectedPlanId,
        billingCycle,
      });

      // Redirect to Midtrans payment page
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert('Failed to initiate payment: ' + error.message);
    }
  };

  if (!isOpen) return null;

  const paidPlans = plans?.filter((p) => p.slug !== 'free' && p.slug !== 'enterprise') || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
                <p className="text-blue-100 text-sm">Unlock more locations and features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>

          {/* Plans Grid */}
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {paidPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const monthlyPrice =
                  billingCycle === 'yearly'
                    ? (plan.price_yearly / 100000 / 12)
                    : (plan.price_monthly / 100000);
                const totalPrice =
                  billingCycle === 'yearly'
                    ? (plan.price_yearly / 100000)
                    : (plan.price_monthly / 100000);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.slug === 'basic' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {monthlyPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed Rp {totalPrice.toLocaleString('id-ID')} yearly
                        </p>
                      )}
                    </div>

                    {/* Key Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {plan.max_locations === -1 ? 'Unlimited' : plan.max_locations} toilet locations
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">
                          {plan.max_users === -1 ? 'Unlimited' : plan.max_users} team members
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium">
                          {plan.max_inspections_per_month
                            ? `${plan.max_inspections_per_month.toLocaleString()} inspections/month`
                            : 'Unlimited inspections'}
                        </span>
                      </div>
                    </div>

                    {/* All Features */}
                    <div className="space-y-2">
                      {(plan.features as string[]).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 capitalize">
                            {feature.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-blue-600 text-white rounded-full p-1">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 border-t pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={createSubscription.isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {createSubscription.isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Upgrade Now</span>
                </>
              )}
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-center text-gray-500 mt-4">
            🔒 Secure payment powered by Midtrans • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
