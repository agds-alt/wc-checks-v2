// Subscription Router - Full Subscription Management
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getSupabaseServerClient } from '@/infrastructure/database/supabase/client';
import { getSnapClient } from '@/lib/midtrans/config';
import { nanoid } from 'nanoid';

export const subscriptionRouter = router({
  /**
   * Get all available plans
   */
  getPlans: protectedProcedure.query(async () => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('[subscription.getPlans] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch plans',
      });
    }

    return data;
  }),

  /**
   * Get current organization subscription
   */
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('organization_id', ctx.user.organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (which is OK)
      console.error('[subscription.getCurrentSubscription] Error:', error);
    }

    return data;
  }),

  /**
   * Get organization's current plan
   */
  getCurrentPlan: protectedProcedure.query(async ({ ctx }) => {
    const supabase = getSupabaseServerClient();

    const { data: org, error } = await supabase
      .from('organizations')
      .select(`
        current_plan_id,
        plan:plans(*)
      `)
      .eq('id', ctx.user.organizationId)
      .single();

    if (error || !org) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      });
    }

    return org.plan;
  }),

  /**
   * Create subscription and initiate payment
   */
  createSubscription: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        billingCycle: z.enum(['monthly', 'yearly']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = getSupabaseServerClient();
      const snap = getSnapClient();

      if (!snap) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment gateway not configured. Please contact support.',
        });
      }

      // 1. Get plan details
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', input.planId)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan not found or inactive',
        });
      }

      // 2. Check if can't upgrade from free to free
      if (plan.id === 'free') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot create subscription for free plan',
        });
      }

      // 3. Calculate amount (convert from cents to rupiah)
      const amount =
        input.billingCycle === 'yearly'
          ? plan.price_yearly / 100000
          : plan.price_monthly / 100000;

      if (amount === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This plan requires custom pricing. Please contact sales.',
        });
      }

      // 4. Create subscription record
      const subscriptionId = `sub_${nanoid(16)}`;
      const orderId = `ORDER-${Date.now()}-${nanoid(8)}`;

      const periodStart = new Date();
      const periodEnd = new Date();
      if (input.billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Check if subscription already exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('organization_id', ctx.user.organizationId)
        .single();

      if (existingSub) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({
            plan_id: input.planId,
            status: 'pending',
            billing_cycle: input.billingCycle,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        // Create new subscription
        await supabase.from('subscriptions').insert({
          id: subscriptionId,
          organization_id: ctx.user.organizationId,
          plan_id: input.planId,
          status: 'pending',
          billing_cycle: input.billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      }

      // 5. Create payment record
      await supabase.from('payments').insert({
        id: `pay_${nanoid(16)}`,
        subscription_id: existingSub?.id || subscriptionId,
        organization_id: ctx.user.organizationId,
        order_id: orderId,
        amount,
        status: 'pending',
      });

      // 6. Get user details for Midtrans
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, phone')
        .eq('id', ctx.user.userId)
        .single();

      // 7. Create Midtrans transaction
      try {
        const transaction = await snap.createTransaction({
          transaction_details: {
            order_id: orderId,
            gross_amount: amount,
          },
          customer_details: {
            first_name: user?.full_name || 'User',
            email: user?.email || '',
            phone: user?.phone || '',
          },
          item_details: [
            {
              id: plan.id,
              price: amount,
              quantity: 1,
              name: `${plan.name} Plan - ${input.billingCycle}`,
            },
          ],
          callbacks: {
            finish: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
            error: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/error`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/pending`,
          },
        });

        console.log('[subscription.createSubscription] Transaction created:', {
          orderId,
          token: transaction.token,
        });

        return {
          subscriptionId: existingSub?.id || subscriptionId,
          orderId,
          paymentToken: transaction.token,
          paymentUrl: transaction.redirect_url,
        };
      } catch (error: any) {
        console.error('[subscription.createSubscription] Midtrans error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment transaction: ' + error.message,
        });
      }
    }),

  /**
   * Check resource limit for organization
   */
  checkLimit: protectedProcedure
    .input(
      z.object({
        resource: z.enum(['locations', 'users', 'inspections']),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = getSupabaseServerClient();

      // Get current plan with limits
      const { data: org } = await supabase
        .from('organizations')
        .select(`
          current_plan_id,
          plan:plans(*)
        `)
        .eq('id', ctx.user.organizationId)
        .single();

      if (!org?.plan) {
        return {
          canPerform: false,
          reason: 'No active plan',
          currentCount: 0,
          limit: 0,
          planName: 'Unknown',
          utilizationPercent: 0,
        };
      }

      const plan = org.plan as any;

      // Get current count based on resource type
      let currentCount = 0;
      let limit = 0;

      switch (input.resource) {
        case 'locations':
          const { count: locCount } = await supabase
            .from('locations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', ctx.user.organizationId)
            .eq('is_active', true);
          currentCount = locCount || 0;
          limit = plan.max_locations;
          break;

        case 'users':
          const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', ctx.user.organizationId)
            .eq('is_active', true);
          currentCount = userCount || 0;
          limit = plan.max_users;
          break;

        case 'inspections':
          // Check monthly limit
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const { count: inspCount } = await supabase
            .from('inspection_records')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', ctx.user.organizationId)
            .gte('inspection_date', monthStart.toISOString().split('T')[0]);
          currentCount = inspCount || 0;
          limit = plan.max_inspections_per_month || -1;
          break;
      }

      // -1 means unlimited
      const canPerform = limit === -1 || currentCount < limit;
      const utilizationPercent = limit > 0 ? Math.round((currentCount / limit) * 100) : 0;

      return {
        canPerform,
        currentCount,
        limit,
        planName: plan.name,
        utilizationPercent,
        isNearLimit: utilizationPercent >= 80,
        isAtLimit: !canPerform,
      };
    }),

  /**
   * Get payment history for organization
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        subscription:subscriptions(
          plan:plans(name)
        )
      `)
      .eq('organization_id', ctx.user.organizationId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[subscription.getPaymentHistory] Error:', error);
      return [];
    }

    return data;
  }),

  /**
   * Cancel subscription (at period end)
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const supabase = getSupabaseServerClient();

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', ctx.user.organizationId)
      .single();

    if (!sub) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active subscription found',
      });
    }

    // Mark for cancellation at period end
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    console.log('[subscription.cancelSubscription] Subscription marked for cancellation:', sub.id);

    return {
      success: true,
      message: 'Subscription will be cancelled at the end of current period',
      periodEnd: sub.current_period_end,
    };
  }),
});
