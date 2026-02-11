# Database Migration Guide

## 🗄️ Subscription System Setup

### Step 1: Run Migrations on Supabase

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `wc-checks-v2`
   - Navigate to **SQL Editor**

2. **Run Migration 001** (Create Tables)
   ```bash
   # Copy content from:
   database/migrations/001_create_subscription_tables.sql

   # Paste in SQL Editor → Run
   ```

3. **Run Migration 002** (Seed Plans)
   ```bash
   # Copy content from:
   database/migrations/002_seed_plans.sql

   # Paste in SQL Editor → Run
   ```

### Step 2: Verify Setup

Run this query to check:

```sql
-- Verify plans
SELECT id, name, max_locations, max_users,
       price_monthly / 100000 as monthly_rp_k,
       price_yearly / 100000 as yearly_rp_k
FROM plans
ORDER BY sort_order;

-- Verify organizations have default plan
SELECT id, name, current_plan_id
FROM organizations
LIMIT 5;
```

Expected result:
- 4 plans (free, basic, pro, enterprise)
- All organizations have `current_plan_id = 'free'`

### Step 3: Enable RLS (Row Level Security)

```sql
-- Enable RLS on new tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Plans: Public read
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- Subscriptions: Organization members only
CREATE POLICY "Users can view their org subscription"
  ON subscriptions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Payments: Organization members only
CREATE POLICY "Users can view their org payments"
  ON payments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Usage stats: Organization members only
CREATE POLICY "Users can view their org usage"
  ON usage_stats FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

## 📊 Pricing Tiers Summary

| Plan       | Locations | Users | Price/Month | Price/Year   |
|------------|-----------|-------|-------------|--------------|
| Free       | 5         | 3     | Rp 0        | Rp 0         |
| Basic      | 25        | 10    | Rp 199,000  | Rp 1,910,400 |
| Pro        | 100       | 50    | Rp 499,000  | Rp 4,790,400 |
| Enterprise | Unlimited | Unlimited | Custom  | Custom       |

## 🔄 Rollback (If Needed)

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS usage_stats CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- Remove columns from organizations
ALTER TABLE organizations
  DROP COLUMN IF EXISTS current_plan_id,
  DROP COLUMN IF EXISTS subscription_id;
```

## ✅ Next Steps

After database setup:
1. Install Midtrans SDK: `pnpm add midtrans-client`
2. Setup environment variables
3. Implement tRPC subscription router
4. Build frontend components
