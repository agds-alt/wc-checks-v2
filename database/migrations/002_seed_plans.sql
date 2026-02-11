-- Seed Plans Data for WC-CHECKS-V2
-- Run this AFTER 001_create_subscription_tables.sql

-- ============================================
-- INSERT PRICING PLANS
-- ============================================

INSERT INTO plans (
  id, name, slug, description,
  max_locations, max_users, max_inspections_per_month, data_retention_days,
  price_monthly, price_yearly, currency, features, is_active, sort_order
) VALUES

-- FREE PLAN (Forever Free)
(
  'free',
  'Free',
  'free',
  'Perfect for testing and small single building',
  5,                    -- max_locations
  3,                    -- max_users
  100,                  -- max_inspections_per_month
  30,                   -- data_retention_days
  0,                    -- price_monthly (free)
  0,                    -- price_yearly (free)
  'IDR',
  '["basic_analytics", "mobile_app", "qr_scanning"]'::jsonb,
  true,
  1
),

-- BASIC PLAN
(
  'basic',
  'Basic',
  'basic',
  'For small businesses with 1-2 buildings',
  25,                   -- max_locations
  10,                   -- max_users
  1000,                 -- max_inspections_per_month
  180,                  -- data_retention_days (6 months)
  19900000,             -- price_monthly (Rp 199,000 in cents)
  191040000,            -- price_yearly (Rp 1,910,400 - 20% discount)
  'IDR',
  '["advanced_analytics", "pdf_export", "email_support", "6_months_history", "no_watermark"]'::jsonb,
  true,
  2
),

-- PRO PLAN
(
  'pro',
  'Pro',
  'pro',
  'For growing teams with multiple buildings',
  100,                  -- max_locations
  50,                   -- max_users
  NULL,                 -- unlimited inspections
  NULL,                 -- unlimited history
  49900000,             -- price_monthly (Rp 499,000)
  479040000,            -- price_yearly (Rp 4,790,400 - 20% discount)
  'IDR',
  '["advanced_analytics", "pdf_export", "api_access", "custom_branding", "priority_support", "unlimited_history", "custom_reports", "team_collaboration"]'::jsonb,
  true,
  3
),

-- ENTERPRISE PLAN
(
  'enterprise',
  'Enterprise',
  'enterprise',
  'For large organizations requiring custom solutions',
  -1,                   -- unlimited locations
  -1,                   -- unlimited users
  NULL,                 -- unlimited inspections
  NULL,                 -- unlimited history
  0,                    -- custom pricing
  0,                    -- custom pricing
  'IDR',
  '["everything_in_pro", "dedicated_account_manager", "sla_guarantee", "custom_integration", "on_premise_option", "white_label", "advanced_security", "priority_onboarding"]'::jsonb,
  true,
  4
)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  max_locations = EXCLUDED.max_locations,
  max_users = EXCLUDED.max_users,
  max_inspections_per_month = EXCLUDED.max_inspections_per_month,
  data_retention_days = EXCLUDED.data_retention_days,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================
-- SET ALL EXISTING ORGANIZATIONS TO FREE PLAN
-- ============================================

UPDATE organizations
SET current_plan_id = 'free'
WHERE current_plan_id IS NULL;

-- ============================================
-- VERIFY SEED DATA
-- ============================================

-- Check plans
SELECT
  id,
  name,
  max_locations,
  max_users,
  price_monthly / 100000 as price_monthly_rp_k,
  price_yearly / 100000 as price_yearly_rp_k
FROM plans
ORDER BY sort_order;

-- Expected output:
-- id         | name       | max_locations | max_users | price_monthly_rp_k | price_yearly_rp_k
-- -----------|------------|---------------|-----------|--------------------|-----------------
-- free       | Free       | 5             | 3         | 0                  | 0
-- basic      | Basic      | 25            | 10        | 199                | 1910
-- pro        | Pro        | 100           | 50        | 499                | 4790
-- enterprise | Enterprise | -1            | -1        | 0                  | 0
