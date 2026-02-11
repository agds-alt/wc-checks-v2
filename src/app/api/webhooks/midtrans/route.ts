// Midtrans Webhook Handler - Automated Payment Processing
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/infrastructure/database/supabase/client';
import { verifyMidtransSignature, isPaymentSuccess, isPaymentFailed } from '@/lib/midtrans/config';

/**
 * POST /api/webhooks/midtrans
 *
 * Receives payment notifications from Midtrans
 * Automatically activates subscriptions on successful payment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('[Midtrans Webhook] 📨 Received notification:', {
      orderId: body.order_id,
      transactionStatus: body.transaction_status,
      grossAmount: body.gross_amount,
    });

    // 1. Verify signature for security
    const isValid = verifyMidtransSignature(
      body.order_id,
      body.status_code,
      body.gross_amount,
      body.signature_key
    );

    if (!isValid) {
      console.error('[Midtrans Webhook] ❌ Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    // 2. Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .eq('order_id', body.order_id)
      .single();

    if (paymentError || !payment) {
      console.error('[Midtrans Webhook] ❌ Payment not found:', body.order_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('[Midtrans Webhook] 💳 Payment found:', {
      paymentId: payment.id,
      subscriptionId: payment.subscription_id,
      organizationId: payment.organization_id,
    });

    // 3. Update payment record with transaction details
    await supabase
      .from('payments')
      .update({
        transaction_id: body.transaction_id,
        payment_type: body.payment_type,
        status: body.transaction_status,
        transaction_time: body.transaction_time,
        settlement_time: body.settlement_time,
        midtrans_response: body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // 4. Handle based on transaction status
    if (isPaymentSuccess(body.transaction_status)) {
      // ✅ PAYMENT SUCCESS - ACTIVATE SUBSCRIPTION

      const subscription = payment.subscription as any;

      // Get plan details
      const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', subscription.plan_id)
        .single();

      if (!plan) {
        console.error('[Midtrans Webhook] ❌ Plan not found:', subscription.plan_id);
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      // Update subscription status to active
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      // Update organization plan (THIS IS THE KEY!)
      await supabase
        .from('organizations')
        .update({
          current_plan_id: subscription.plan_id,
          subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.organization_id);

      console.log('[Midtrans Webhook] ✅ SUBSCRIPTION ACTIVATED:', {
        subscriptionId: subscription.id,
        organizationId: subscription.organization_id,
        plan: plan.name,
        maxLocations: plan.max_locations,
      });

      // TODO: Send email confirmation
      // await sendSubscriptionActivatedEmail(subscription, plan);

      return NextResponse.json({
        success: true,
        message: 'Subscription activated successfully',
        subscriptionId: subscription.id,
      });

    } else if (isPaymentFailed(body.transaction_status)) {
      // ❌ PAYMENT FAILED

      await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.subscription_id);

      console.log('[Midtrans Webhook] ❌ Payment failed:', {
        orderId: body.order_id,
        status: body.transaction_status,
        reason: body.status_message,
      });

      return NextResponse.json({
        success: false,
        message: 'Payment failed',
        status: body.transaction_status,
      });

    } else {
      // ⏳ PAYMENT PENDING OR OTHER STATUS

      console.log('[Midtrans Webhook] ⏳ Payment pending:', {
        orderId: body.order_id,
        status: body.transaction_status,
      });

      return NextResponse.json({
        success: true,
        message: 'Payment status updated',
        status: body.transaction_status,
      });
    }

  } catch (error: any) {
    console.error('[Midtrans Webhook] 💥 Error:', error);
    return NextResponse.json(
      {
        error: error.message,
        details: 'Internal server error processing webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/midtrans
 * Simple health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Midtrans webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
