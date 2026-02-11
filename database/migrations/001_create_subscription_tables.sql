-- WC-CHECKS-V2 Subscription System Migration
-- Run this on your Supabase SQL Editor

-- ============================================
-- 1. PLANS TABLE (Master Data)
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,

  -- Limits
  max_locations INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  max_inspections_per_month INTEGER, -- NULL = unlimited
  data_retention_days INTEGER, -- NULL = unlimited

  -- Pricing (in rupiah cents for precision)
  price_monthly INTEGER NOT NULL, -- e.g., 19900000 = Rp 199,000
  price_yearly INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',

  -- Features (JSON array)
  features JSONB DEFAULT '[]'::jsonb,
  -- Example: ["advanced_analytics", "api_access", "custom_branding"]

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for active plans
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active, sort_order);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(50) PRIMARY KEY,
  organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) REFERENCES plans(id),

  -- Status: 'trial', 'active', 'past_due', 'cancelled', 'expired'
  status VARCHAR(20) NOT NULL DEFAULT 'trial',

  -- Billing
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly' or 'yearly'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,

  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_active_subscription UNIQUE(organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  subscription_id VARCHAR(50) REFERENCES subscriptions(id) ON DELETE SET NULL,
  organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,

  -- Midtrans
  order_id VARCHAR(100) UNIQUE NOT NULL,
  transaction_id VARCHAR(100),
  payment_type VARCHAR(50),

  -- Amount (in rupiah)
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',

  -- Status: 'pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund'
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- Timestamps
  transaction_time TIMESTAMPTZ,
  settlement_time TIMESTAMPTZ,

  -- Raw data from Midtrans
  midtrans_response JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);

-- ============================================
-- 4. USAGE STATS TABLE (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_stats (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,

  -- Period
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,

  -- Counts
  locations_count INTEGER DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  inspections_count INTEGER DEFAULT 0,

  -- Metadata
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per org per month
  CONSTRAINT unique_usage_period UNIQUE(organization_id, year, month)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_usage_stats_org_period ON usage_stats(organization_id, year, month);

-- ============================================
-- 5. UPDATE ORGANIZATIONS TABLE
-- ============================================
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS current_plan_id VARCHAR(50) REFERENCES plans(id) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(50) REFERENCES subscriptions(id);

-- Index
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(current_plan_id);

-- ============================================
-- 6. TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to plans
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Ready for seed data
-- ============================================

COMMENT ON TABLE plans IS 'Master pricing plans configuration';
COMMENT ON TABLE subscriptions IS 'Active subscriptions for organizations';
COMMENT ON TABLE payments IS 'Payment transactions history';
COMMENT ON TABLE usage_stats IS 'Monthly usage statistics for billing';
