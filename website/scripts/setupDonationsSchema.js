// scripts/setupDonationsSchema.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL for creating donation tables and indices
const donationSchemaSql = `
  -- Donations table
  CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_id VARCHAR(255),
    donor_email VARCHAR(255),
    donor_name VARCHAR(255),
    fund_designation VARCHAR(100),
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(20),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
  );

  -- Donation designations/funds
  CREATE TABLE IF NOT EXISTS donation_designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    target_amount_cents INTEGER,
    current_amount_cents INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Recurring donation management
  CREATE TABLE IF NOT EXISTS recurring_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_email VARCHAR(255) NOT NULL,
    donor_name VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fund_designation VARCHAR(100),
    frequency VARCHAR(20) NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    next_payment_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_donations_date ON donations (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_donations_email ON donations (donor_email);
  CREATE INDEX IF NOT EXISTS idx_donations_payment_id ON donations (stripe_payment_id);
  CREATE INDEX IF NOT EXISTS idx_recurring_email ON recurring_donations (donor_email);
  CREATE INDEX IF NOT EXISTS idx_recurring_subscription ON recurring_donations (stripe_subscription_id);

  -- RLS Policies
  -- Enable RLS on tables
  ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE donation_designations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE recurring_donations ENABLE ROW LEVEL SECURITY;

  -- Create policies
  -- Donation designations are public (read-only)
  CREATE POLICY "Public can view active donation designations" ON donation_designations
    FOR SELECT USING (is_active = true);
  
  -- Admin policy for full access to all tables
  CREATE POLICY "Admins have full access to donations" ON donations
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
  
  CREATE POLICY "Admins have full access to designations" ON donation_designations
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
  
  CREATE POLICY "Admins have full access to recurring donations" ON recurring_donations
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
  
  -- Donors can view their own donations
  CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT
    USING (donor_email = auth.email());
  
  CREATE POLICY "Users can view their own recurring donations" ON recurring_donations
    FOR SELECT
    USING (donor_email = auth.email());

  -- Create initial donation designations
  INSERT INTO donation_designations (name, description, display_order)
  VALUES 
    ('General Fund', 'Support the general operations of the church', 1),
    ('Missions Fund', 'Support our missionary work around the world', 2),
    ('Building Fund', 'Help us maintain and improve our facilities', 3)
  ON CONFLICT (name) DO NOTHING;
`;

async function setupDonationsSchema() {
  try {
    console.log('Setting up donation database schema...');
    
    // Execute the SQL to create tables and policies
    const { error } = await supabase.rpc('exec', { sql: donationSchemaSql });
    
    if (error) throw error;
    
    console.log('✅ Donation schema setup complete!');
    console.log('- Created donations table');
    console.log('- Created donation_designations table');
    console.log('- Created recurring_donations table');
    console.log('- Created indexes');
    console.log('- Set up RLS policies');
    console.log('- Added initial donation designations');
  } catch (error) {
    console.error('Error setting up donation schema:', error);
    process.exit(1);
  }
}

setupDonationsSchema();
