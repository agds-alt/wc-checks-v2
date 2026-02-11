# Subscription System Setup Guide

## Overview
This guide will help you set up and test the subscription system with Midtrans payment gateway integration.

## Prerequisites
- Node.js 18+ and pnpm installed
- Supabase project with database access
- Midtrans account (free signup at https://midtrans.com)

## 1. Database Setup

### Run Migrations
Execute the following SQL files in order:

```bash
# 1. Create subscription tables
psql $DATABASE_URL < database/migrations/001_create_subscription_tables.sql

# 2. Seed pricing plans
psql $DATABASE_URL < database/migrations/002_seed_plans.sql
```

Or manually run them in Supabase SQL Editor.

### Verify Tables Created
Check that the following tables exist:
- `plans` - Pricing plan definitions
- `subscriptions` - Active subscriptions
- `payments` - Payment transaction history
- `usage_stats` - Resource usage tracking (optional)

### Verify Plans Seeded
```sql
SELECT id, name, slug, max_locations, max_users, price_monthly, price_yearly
FROM plans
WHERE is_active = true
ORDER BY sort_order;
```

You should see 4 plans: Free, Basic, Pro, Enterprise.

## 2. Midtrans Configuration

### Get API Keys
1. Sign up at https://dashboard.midtrans.com
2. Go to Settings → Access Keys
3. Copy your **Sandbox** credentials (for testing):
   - Server Key (starts with `SB-Mid-server-`)
   - Client Key (starts with `SB-Mid-client-`)

### Configure Environment Variables
Create/update `.env.local`:

```bash
# Midtrans Credentials
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SANDBOX_SERVER_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY_HERE
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY_HERE

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**IMPORTANT**: Never commit real API keys to git!

## 3. Install Dependencies

```bash
pnpm install
```

This will install `midtrans-client` and other required packages.

## 4. Start Development Server

```bash
pnpm dev
```

The app should start at `http://localhost:3000`.

## 5. Testing the System

### Test 1: View Pricing Plans
1. Navigate to `http://localhost:3000/pricing`
2. You should see 4 pricing tiers with features
3. Verify billing toggle (Monthly/Yearly) works
4. Check that prices update correctly

### Test 2: Usage Indicators
1. Log in to your account
2. Navigate to dashboard or locations page
3. You should see usage indicators showing:
   - X / Y locations used
   - Progress bar with color coding
   - Upgrade button if near/at limit

### Test 3: Create Subscription (Payment Flow)

#### Step 3.1: Initiate Payment
1. Go to `/pricing` or click "Upgrade" button
2. Select a paid plan (Basic or Pro)
3. Choose billing cycle
4. Click "Upgrade Now" or "Get Started"
5. You should be redirected to Midtrans Snap payment page

#### Step 3.2: Complete Test Payment
On Midtrans Snap page, use **test credit card**:

```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp Date: Any future date (e.g., 01/25)
3D Secure OTP: 112233
```

Other test cards:
- **Success**: `5264 2210 3887 4659` (no 3DS)
- **Failed**: `4111 1111 1111 1111`
- **Pending**: Use GoPay/QRIS (will remain pending)

#### Step 3.3: Verify Success
After successful payment:
1. You'll be redirected to `/subscription/success`
2. Check database: `subscriptions` table should have new entry with `status = 'active'`
3. Check `organizations` table: `current_plan_id` should be updated
4. Check `payments` table: Payment record with `status = 'settlement'`

### Test 4: Limit Enforcement

#### Test Location Limit
1. Create locations until you reach your plan limit
2. Try to create one more location
3. Should see error: "You've reached the maximum number of locations..."
4. Upgrade button should appear

#### Test User Limit
1. Register new users (or update existing users to your org)
2. Try to exceed user limit
3. Should see error: "You've reached the maximum number of users..."

#### Test Inspection Limit
1. Create inspections until you reach monthly limit
2. Try to create one more inspection
3. Should see error: "You've reached the maximum number of inspections..."

### Test 5: Webhook Callback

#### Manual Webhook Test
1. Get your webhook URL: `http://localhost:3000/api/webhooks/midtrans`
2. For local testing, use ngrok:
   ```bash
   ngrok http 3000
   ```
3. Update Midtrans webhook URL:
   - Go to Midtrans Dashboard → Settings → Configuration
   - Set Notification URL: `https://your-ngrok-url.ngrok.io/api/webhooks/midtrans`

#### Verify Webhook Processing
1. Make a payment
2. Check server logs for webhook events
3. Verify subscription status updated automatically
4. Check organization plan activated instantly

## 6. Component Integration

### Add UsageIndicator to Your Pages

```tsx
import { UsageIndicator } from '@/components/subscription/UsageIndicator';

// Compact mode (inline)
<UsageIndicator resource="locations" compact />

// Full mode (with details)
<UsageIndicator
  resource="locations"
  showUpgradeButton={true}
/>
```

### Add Upgrade Modal Trigger

```tsx
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useState } from 'react';

const [showUpgrade, setShowUpgrade] = useState(false);

// Button to open modal
<button onClick={() => setShowUpgrade(true)}>
  Upgrade Plan
</button>

// Modal component
<UpgradeModal
  isOpen={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  suggestedPlanId="basic" // optional
/>
```

## 7. Production Deployment

### Before Going Live:

1. **Update Midtrans to Production**:
   ```env
   MIDTRANS_IS_PRODUCTION=true
   MIDTRANS_SERVER_KEY=your_production_server_key
   MIDTRANS_CLIENT_KEY=your_production_client_key
   ```

2. **Set Production Webhook URL**:
   - Midtrans Dashboard → Settings → Configuration
   - Notification URL: `https://yourdomain.com/api/webhooks/midtrans`

3. **Verify SSL Certificate**:
   - Webhook URL must use HTTPS
   - Midtrans requires valid SSL certificate

4. **Test Production Payment**:
   - Use real credit card with small amount
   - Verify full flow works
   - Check webhook receives notifications

5. **Enable Monitoring**:
   - Add error tracking (Sentry, etc.)
   - Monitor webhook logs
   - Set up alerts for failed payments

## 8. Common Issues

### Issue: Payment redirects to error page
- **Check**: Midtrans API keys are correct
- **Check**: Environment variables loaded (`NEXT_PUBLIC_` prefix for client-side)
- **Check**: Server logs for errors

### Issue: Webhook not received
- **Check**: Webhook URL is accessible (use ngrok for local)
- **Check**: Midtrans dashboard has correct notification URL
- **Check**: Webhook signature verification passes

### Issue: Subscription not activated
- **Check**: Webhook processed successfully (check logs)
- **Check**: Payment status is 'settlement' or 'capture'
- **Check**: Database updated (subscriptions table)

### Issue: Limit checks not working
- **Check**: Organizations have `current_plan_id` set
- **Check**: Plans seeded correctly in database
- **Check**: User context has correct `organizationId`

## 9. Pricing Plan Customization

To modify pricing plans, edit `database/migrations/002_seed_plans.sql`:

```sql
-- Example: Update Basic plan price
UPDATE plans
SET
  price_monthly = 29900000,  -- Rp 299k (in cents)
  price_yearly = 3110400000   -- Rp 3.11M (in cents, 20% discount)
WHERE slug = 'basic';

-- Example: Add new plan
INSERT INTO plans VALUES (
  'starter',
  'Starter',
  'starter',
  'For small teams',
  10,  -- max_locations
  5,   -- max_users
  500, -- max_inspections_per_month
  60,  -- max_data_retention_days
  9900000,  -- price_monthly (Rp 99k)
  95040000, -- price_yearly
  'IDR',
  '["basic_analytics", "email_support"]'::jsonb,
  true,
  2  -- sort_order
);
```

## 10. API Reference

### tRPC Endpoints

#### `subscription.getPlans()`
Get all active pricing plans.

#### `subscription.getCurrentSubscription()`
Get current user's active subscription.

#### `subscription.getCurrentPlan()`
Get current plan with limits.

#### `subscription.checkLimit({ resource })`
Check usage against limit for:
- `resource: 'locations'`
- `resource: 'users'`
- `resource: 'inspections'`

Returns:
```ts
{
  currentCount: number,
  limit: number,
  planName: string,
  utilizationPercent: number,
  isNearLimit: boolean,  // >= 80%
  isAtLimit: boolean      // >= 100%
}
```

#### `subscription.createSubscription({ planId, billingCycle })`
Initiate payment flow.

Returns:
```ts
{
  paymentToken: string,
  paymentUrl: string  // Redirect user here
}
```

#### `subscription.getPaymentHistory()`
Get payment transaction history.

#### `subscription.cancelSubscription()`
Cancel subscription (ends at period end).

## Support

For issues:
1. Check Midtrans logs: https://dashboard.midtrans.com/transactions
2. Check server logs for errors
3. Verify database state manually
4. Test with Midtrans sandbox first

Happy testing! 🚀
