// setupEventsSchema.js - Script to create the events and event_registrations tables in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Load environment variables

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service role key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupEventsSchema() {
  console.log('🔧 Setting up Events schema...');

  try {
    // Check if PostGIS extension is available
    console.log('Checking PostGIS extension...');
    const { data: postgisData, error: postgisCheckError } = await supabase.rpc('exec', {
      query: `SELECT extname FROM pg_extension WHERE extname = 'postgis';`
    });

    if (postgisCheckError) {
      console.warn('⚠️ Could not check for PostGIS extension:', postgisCheckError.message);
      console.warn('If you need geographical features, enable PostGIS in the Supabase dashboard:');
      console.warn('1. Go to your Supabase project dashboard');
      console.warn('2. Navigate to Database > Extensions');
      console.warn('3. Enable the PostGIS extension');
    } else if (!postgisData || postgisData.length === 0) {
      console.warn('⚠️ PostGIS extension not found.');
      console.warn('Attempting to enable it (may require superuser permissions)...');
      
      try {
        const { error: postgisError } = await supabase.rpc('exec', {
          query: `CREATE EXTENSION IF NOT EXISTS postgis;`
        });
        
        if (postgisError) {
          console.warn('⚠️ Could not enable PostGIS extension:', postgisError.message);
          console.warn('Please enable it manually in the Supabase dashboard.');
          console.warn('Continuing with setup without PostGIS...');
        } else {
          console.log('✅ PostGIS extension enabled');
        }
      } catch (err) {
        console.warn('⚠️ Could not enable PostGIS extension:', err.message);
        console.warn('Please enable it manually in the Supabase dashboard.');
        console.warn('Continuing with setup without PostGIS...');
      }
    } else {
      console.log('✅ PostGIS extension is already enabled');
    }

    // Create events table
    console.log('Creating events table...');
    const { error: eventsTableError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(50) NOT NULL, -- 'service', 'study', 'social', 'outreach'
          start_datetime TIMESTAMP NOT NULL,
          end_datetime TIMESTAMP NOT NULL,
          location_name VARCHAR(255),
          location_address TEXT,
          location_coordinates JSONB, -- Store as JSON {lat: x, lng: y} if PostGIS not available
          max_capacity INTEGER,
          registration_required BOOLEAN DEFAULT false,
          registration_deadline TIMESTAMP,
          cost_cents INTEGER DEFAULT 0,
          image_url VARCHAR(500),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(20),
          is_featured BOOLEAN DEFAULT false,
          is_published BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          category VARCHAR(100)
        );
      `
    });

    if (eventsTableError) throw eventsTableError;
    console.log('✅ Events table created');

    // Create event_registrations table
    console.log('Creating event registrations table...');
    const { error: registrationsTableError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS event_registrations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id UUID NOT NULL REFERENCES events(id),
          attendee_name VARCHAR(255) NOT NULL,
          attendee_email VARCHAR(255) NOT NULL,
          attendee_phone VARCHAR(20),
          party_size INTEGER DEFAULT 1,
          special_requests TEXT,
          registration_status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'waitlist', 'cancelled'
          payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
          payment_intent_id VARCHAR(255), -- Stripe payment intent
          registered_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (registrationsTableError) throw registrationsTableError;
    console.log('✅ Event registrations table created');

    // Create indexes for performance
    console.log('Creating indexes...');
    const { error: indexesError } = await supabase.rpc('exec', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_events_datetime ON events (start_datetime, is_published);
        CREATE INDEX IF NOT EXISTS idx_events_type ON events (event_type);
        CREATE INDEX IF NOT EXISTS idx_events_featured ON events (is_featured, start_datetime);
        CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations (event_id);
        CREATE INDEX IF NOT EXISTS idx_registrations_email ON event_registrations (attendee_email);
      `
    });

    if (indexesError) throw indexesError;
    console.log('✅ Indexes created');

    // Setup Row Level Security (RLS)
    console.log('Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec', {
      query: `
        -- Enable RLS for events
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;

        -- Enable RLS for event_registrations
        ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public can view published events" ON events;
        DROP POLICY IF EXISTS "Admin can do everything with events" ON events;
        DROP POLICY IF EXISTS "Admin can view all registrations" ON event_registrations;
        DROP POLICY IF EXISTS "Admin can manage all registrations" ON event_registrations;
        DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
        DROP POLICY IF EXISTS "Anyone can register for events" ON event_registrations;
        
        -- Create policies for events table
        -- Public can view published events
        CREATE POLICY "Public can view published events" ON events
        FOR SELECT 
        USING (is_published = TRUE);
        
        -- Admin can do everything with events (using user_roles table)
        CREATE POLICY "Admin can do everything with events" ON events
        FOR ALL 
        USING (
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );

        -- Create policies for event_registrations table
        -- Admin can see all registrations
        CREATE POLICY "Admin can view all registrations" ON event_registrations
        FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
        
        -- Admin can manage all registrations
        CREATE POLICY "Admin can manage all registrations" ON event_registrations
        FOR ALL 
        USING (
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
        
        -- Users can view their own registrations
        CREATE POLICY "Users can view own registrations" ON event_registrations
        FOR SELECT 
        USING (
          attendee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        );
        
        -- Anyone can register for events (handled by API/backend validation)
        CREATE POLICY "Anyone can register for events" ON event_registrations
        FOR INSERT 
        WITH CHECK (true);
      `
    });
    
    if (rlsError) throw rlsError;
    console.log('✅ Row Level Security policies created');

    // Create trigger for updating events
    console.log('Creating triggers...');
    const { error: triggerError } = await supabase.rpc('exec', {
      query: `
        -- Update the updated_at timestamp automatically
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger for events table
        DROP TRIGGER IF EXISTS update_events_updated_at ON events;
        CREATE TRIGGER update_events_updated_at
        BEFORE UPDATE ON events
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at();
        
        -- Create trigger for event_registrations table
        DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
        CREATE TRIGGER update_event_registrations_updated_at
        BEFORE UPDATE ON event_registrations
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at();
      `
    });
    
    if (triggerError) throw triggerError;
    console.log('✅ Triggers created');
    
    // Create a function to check event capacity before registration
    console.log('Creating event registration functions...');
    const { error: functionError } = await supabase.rpc('exec', {
      query: `
        -- Function to check event capacity before registering
        CREATE OR REPLACE FUNCTION check_event_capacity(event_id UUID, party_size INTEGER)
        RETURNS BOOLEAN AS $$
        DECLARE
          current_capacity INTEGER;
          max_capacity INTEGER;
          available_spots INTEGER;
        BEGIN
          -- Get the event's max capacity
          SELECT e.max_capacity INTO max_capacity FROM events e WHERE e.id = event_id;
          
          -- If no max capacity, return true (unlimited)
          IF max_capacity IS NULL THEN
            RETURN TRUE;
          END IF;
          
          -- Calculate current capacity
          SELECT COALESCE(SUM(r.party_size), 0) INTO current_capacity
          FROM event_registrations r
          WHERE r.event_id = event_id AND r.registration_status = 'confirmed';
          
          -- Calculate available spots
          available_spots = max_capacity - current_capacity;
          
          -- Return true if there's enough room
          RETURN party_size <= available_spots;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (functionError) throw functionError;
    console.log('✅ Functions created');

    // Insert sample event data if needed
    console.log('Checking for existing events...');
    const { data: existingEvents, error: countError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (countError) throw countError;
    
    if (!existingEvents || existingEvents.length === 0) {
      console.log('Creating sample events...');
      const now = new Date();
      
      const sampleEvents = [
        {
          title: 'Sunday Worship Service',
          description: 'Join us for our weekly worship service with praise, prayer, and teaching.',
          event_type: 'service',
          start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 10, 0).toISOString(),
          end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 12, 0).toISOString(),
          location_name: 'Main Sanctuary',
          location_address: '123 Church Street',
          location_coordinates: { lat: 40.712776, lng: -74.005974 },
          registration_required: false,
          is_featured: true,
          is_published: true,
          category: 'worship'
        },
        {
          title: 'Bible Study',
          description: 'Weekly Bible study on the book of Romans.',
          event_type: 'study',
          start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 19, 0).toISOString(),
          end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 20, 30).toISOString(),
          location_name: 'Fellowship Hall',
          location_address: '123 Church Street',
          location_coordinates: { lat: 40.712776, lng: -74.005974 },
          registration_required: false,
          is_featured: false,
          is_published: true,
          category: 'education'
        },
        {
          title: 'Community Outreach',
          description: 'Join us as we serve the local homeless shelter.',
          event_type: 'outreach',
          start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 9, 0).toISOString(),
          end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 14, 0).toISOString(),
          location_name: 'Community Shelter',
          location_address: '456 Main Street',
          location_coordinates: { lat: 40.730610, lng: -73.935242 },
          registration_required: true,
          registration_deadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString(),
          max_capacity: 20,
          is_featured: true,
          is_published: true,
          category: 'service'
        }
      ];
      
      const { error: insertError } = await supabase
        .from('events')
        .insert(sampleEvents);
      
      if (insertError) throw insertError;
      console.log('✅ Sample events created');
    } else {
      console.log('✅ Events already exist, skipping sample data');
    }

    console.log('🎉 Events schema setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up Events schema:', error);
    process.exit(1);
  }
}

setupEventsSchema();
