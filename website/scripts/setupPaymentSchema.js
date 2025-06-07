const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupPaymentSchema() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Setting up payment schema...');

    // Add new columns to event_registrations table
    console.log('Adding payment-related columns to event_registrations...');
    const { error: alterError } = await supabase.rpc('exec', {
      query: `
        -- Add payment tracking columns
        ALTER TABLE event_registrations
        ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(20),
        ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT,
        ADD COLUMN IF NOT EXISTS waitlist_position INTEGER,
        ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(100);

        -- Create index on payment_intent_id for faster lookups
        CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_intent
        ON event_registrations(payment_intent_id);

        -- Create index on confirmation_code for faster lookups
        CREATE INDEX IF NOT EXISTS idx_event_registrations_confirmation
        ON event_registrations(confirmation_code);
      `
    });

    if (alterError) {
      throw new Error(`Failed to alter table: ${alterError.message}`);
    }

    // Create payment_logs table for audit trail
    console.log('Creating payment_logs table...');
    const { error: createError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS payment_logs (
          id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
          registration_id UUID REFERENCES event_registrations(id),
          payment_intent_id VARCHAR(100),
          amount_cents INTEGER,
          status VARCHAR(50),
          error_message TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create index on registration_id for faster lookups
        CREATE INDEX IF NOT EXISTS idx_payment_logs_registration
        ON payment_logs(registration_id);

        -- Create index on payment_intent_id for faster lookups
        CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_intent
        ON payment_logs(payment_intent_id);

        -- Create trigger to update updated_at
        CREATE OR REPLACE FUNCTION trigger_set_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Add trigger to payment_logs
        DROP TRIGGER IF EXISTS set_timestamp ON payment_logs;
        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON payment_logs
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();
      `
    });

    if (createError) {
      throw new Error(`Failed to create payment_logs table: ${createError.message}`);
    }

    console.log('✅ Payment schema setup complete!');
  } catch (error) {
    console.error('❌ Error setting up payment schema:', error);
    process.exit(1);
  }
}

// Run the setup
setupPaymentSchema();
