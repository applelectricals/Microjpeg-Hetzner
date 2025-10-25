-- ============================================
-- TIER LIMITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tier_limits (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(50) UNIQUE NOT NULL,
  tier_display_name VARCHAR(100) NOT NULL,
  tier_description TEXT,
  
  monthly_operations INTEGER NOT NULL,
  daily_operations INTEGER,
  hourly_operations INTEGER,
  
  max_file_size_regular INTEGER NOT NULL,
  max_file_size_raw INTEGER NOT NULL,
  
  max_concurrent_uploads INTEGER NOT NULL,
  max_batch_size INTEGER DEFAULT 5,
  
  processing_timeout_seconds INTEGER DEFAULT 30,
  priority_processing BOOLEAN DEFAULT FALSE,
  
  api_calls_monthly INTEGER DEFAULT 0,
  team_seats INTEGER DEFAULT 1,
  has_analytics BOOLEAN DEFAULT FALSE,
  has_webhooks BOOLEAN DEFAULT FALSE,
  has_custom_profiles BOOLEAN DEFAULT FALSE,
  has_white_label BOOLEAN DEFAULT FALSE,
  
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_visible_on_pricing BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tier_limits_name ON tier_limits(tier_name);

-- ============================================
-- SEED TIER DATA
-- ============================================
INSERT INTO tier_limits (
  tier_name, tier_display_name, tier_description,
  monthly_operations, daily_operations, hourly_operations,
  max_file_size_regular, max_file_size_raw,
  max_concurrent_uploads, max_batch_size,
  processing_timeout_seconds, priority_processing,
  api_calls_monthly, team_seats,
  has_analytics, has_webhooks, has_custom_profiles, has_white_label,
  price_monthly, price_yearly,
  is_active
) VALUES
('free', 'Free', '250 operations/month, no signup required',
  250, 25, 5, 10, 25, 3, 3, 30, FALSE, 0, 1,
  FALSE, FALSE, FALSE, FALSE, 0.00, 0.00, TRUE),
  
('starter', 'Starter', 'Perfect for freelancers',
  3000, NULL, NULL, 50, 50, 20, 20, 60, TRUE, 1000, 1,
  TRUE, FALSE, FALSE, FALSE, 9.00, 79.00, TRUE),
  
('pro', 'Pro', 'For agencies and professionals',
  15000, NULL, NULL, 100, 100, 50, 200, 120, TRUE, 15000, 3,
  TRUE, TRUE, TRUE, FALSE, 19.00, 149.00, TRUE),
  
('business', 'Business', 'For large agencies',
  50000, NULL, NULL, 500, 500, 100, 500, 300, TRUE, 100000, 10,
  TRUE, TRUE, TRUE, TRUE, 49.00, 399.00, TRUE)
ON CONFLICT (tier_name) DO NOTHING;

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none';