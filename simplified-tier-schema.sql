-- SIMPLIFIED TIER SYSTEM
-- 6 tiers only: Starter-M, Starter-Y, Pro-M, Pro-Y, Business-M, Business-Y
-- Privileges granted per user based on payment confirmation

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_tier_grants CASCADE;
DROP TABLE IF EXISTS tier_definitions CASCADE;

-- Tier Definitions Table
CREATE TABLE tier_definitions (
    tier_id SERIAL PRIMARY KEY,
    tier_name VARCHAR(50) UNIQUE NOT NULL,
    tier_display_name VARCHAR(100) NOT NULL,
    billing_period VARCHAR(20) NOT NULL, -- 'monthly' or 'yearly'
    
    -- Upload limits
    max_file_size_mb INTEGER NOT NULL,
    max_batch_uploads INTEGER NOT NULL,
    
    -- Usage limits
    operations_per_period INTEGER NOT NULL,
    
    -- Pricing
    price_amount DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Tier Grants Table
CREATE TABLE user_tier_grants (
    grant_id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    tier_id INTEGER REFERENCES tier_definitions(tier_id),
    
    -- Grant details
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(100) DEFAULT 'admin',
    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_confirmation_date TIMESTAMP,
    
    -- Usage tracking
    operations_used INTEGER DEFAULT 0,
    period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    period_end TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_email)
);

-- Insert 6 tier definitions
INSERT INTO tier_definitions (tier_name, tier_display_name, billing_period, max_file_size_mb, max_batch_uploads, operations_per_period, price_amount) VALUES
('starter-m', 'Starter Monthly', 'monthly', 75, 20, 3000, 9.00),
('starter-y', 'Starter Yearly', 'yearly', 75, 20, 36000, 90.00),
('pro-m', 'Pro Monthly', 'monthly', 150, 50, 10000, 29.00),
('pro-y', 'Pro Yearly', 'yearly', 150, 50, 120000, 290.00),
('business-m', 'Business Monthly', 'monthly', 500, 100, 50000, 99.00),
('business-y', 'Business Yearly', 'yearly', 500, 100, 600000, 990.00);

-- Grant Starter-M tier to richngrand@gmail.com
INSERT INTO user_tier_grants (user_email, tier_id, payment_confirmed, payment_confirmation_date, period_end)
SELECT 'richngrand@gmail.com', tier_id, TRUE, CURRENT_TIMESTAMP, 
       CURRENT_TIMESTAMP + INTERVAL '1 month'
FROM tier_definitions 
WHERE tier_name = 'starter-m';

-- View to get user tier info
CREATE OR REPLACE VIEW user_tier_info AS
SELECT 
    utg.user_email,
    td.tier_name,
    td.tier_display_name,
    td.billing_period,
    td.max_file_size_mb,
    td.max_batch_uploads,
    td.operations_per_period,
    utg.operations_used,
    (td.operations_per_period - utg.operations_used) as operations_remaining,
    ROUND((utg.operations_used::DECIMAL / td.operations_per_period * 100), 2) as usage_percentage,
    utg.period_start,
    utg.period_end,
    utg.payment_confirmed,
    utg.is_active
FROM user_tier_grants utg
JOIN tier_definitions td ON utg.tier_id = td.tier_id
WHERE utg.is_active = TRUE;

-- Function to check user limits
CREATE OR REPLACE FUNCTION check_user_can_operate(
    p_user_email VARCHAR(255),
    p_file_size_mb INTEGER,
    p_batch_size INTEGER
) RETURNS TABLE(
    can_operate BOOLEAN,
    reason TEXT,
    operations_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN uti.is_active = FALSE THEN FALSE
            WHEN uti.payment_confirmed = FALSE THEN FALSE
            WHEN uti.period_end < CURRENT_TIMESTAMP THEN FALSE
            WHEN p_file_size_mb > uti.max_file_size_mb THEN FALSE
            WHEN p_batch_size > uti.max_batch_uploads THEN FALSE
            WHEN uti.operations_remaining <= 0 THEN FALSE
            ELSE TRUE
        END as can_operate,
        CASE 
            WHEN uti.is_active = FALSE THEN 'Account is not active'
            WHEN uti.payment_confirmed = FALSE THEN 'Payment not confirmed'
            WHEN uti.period_end < CURRENT_TIMESTAMP THEN 'Subscription expired'
            WHEN p_file_size_mb > uti.max_file_size_mb THEN 'File size exceeds limit'
            WHEN p_batch_size > uti.max_batch_uploads THEN 'Batch size exceeds limit'
            WHEN uti.operations_remaining <= 0 THEN 'Monthly limit reached'
            ELSE 'OK'
        END as reason,
        uti.operations_remaining
    FROM user_tier_info uti
    WHERE uti.user_email = p_user_email;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_user_operations(
    p_user_email VARCHAR(255),
    p_operation_count INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_tier_grants
    SET operations_used = operations_used + p_operation_count
    WHERE user_email = p_user_email
    AND is_active = TRUE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX idx_user_tier_grants_email ON user_tier_grants(user_email);
CREATE INDEX idx_user_tier_grants_active ON user_tier_grants(is_active) WHERE is_active = TRUE;
