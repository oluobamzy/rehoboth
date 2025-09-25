-- ==============================
-- COMPREHENSIVE EVENT PERMISSIONS FIX
-- ==============================
-- Run this script in Supabase SQL Editor to fix event permissions

-- ======== STEP 1: ENSURE EVENTS TABLE HAS PROPER RLS POLICIES ========

-- Make sure RLS is enabled on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing event policies
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Admin full access events" ON events;

-- Recreate event table policies
CREATE POLICY "Public can view published events"
ON events FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage events"
ON events FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ======== STEP 2: ENSURE EVENT_REGISTRATIONS TABLE HAS PROPER POLICIES ========

-- Enable RLS on event_registrations if it exists and check its structure
DO $$
DECLARE
    has_user_id BOOLEAN;
    has_email BOOLEAN;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
    -- Check which columns exist for user identification
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'event_registrations' AND column_name = 'user_id'
    ) INTO has_user_id;
    
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'event_registrations' AND column_name = 'email'
    ) INTO has_email;
    
    ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
    DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
    DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;
    DROP POLICY IF EXISTS "Admins can manage all registrations" ON event_registrations;
    
    -- Create policies based on available columns
    IF has_user_id THEN
      -- Use user_id column if it exists
      CREATE POLICY "Users can view own registrations"
      ON event_registrations FOR SELECT
      USING (user_id = auth.uid() OR (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.jwt() ->> 'role' = 'admin'
        OR EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      ));
      
      CREATE POLICY "Users can register for events"
      ON event_registrations FOR INSERT
      WITH CHECK (user_id = auth.uid());
      
      CREATE POLICY "Users can update own registrations"
      ON event_registrations FOR UPDATE
      USING (user_id = auth.uid());
      
    ELSIF has_email THEN
      -- Use email column if user_id doesn't exist
      CREATE POLICY "Users can view own registrations"
      ON event_registrations FOR SELECT
      USING (email = auth.jwt() ->> 'email' OR (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.jwt() ->> 'role' = 'admin'
        OR EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      ));
      
      CREATE POLICY "Users can register for events"
      ON event_registrations FOR INSERT
      WITH CHECK (true); -- Allow any authenticated user to register
      
      CREATE POLICY "Users can update own registrations"
      ON event_registrations FOR UPDATE
      USING (email = auth.jwt() ->> 'email');
      
    ELSE
      -- If neither user_id nor email exists, create admin-only policies
      CREATE POLICY "Admin only access to registrations"
      ON event_registrations FOR ALL
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.jwt() ->> 'role' = 'admin'
        OR EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
    END IF;
    
    -- Admin policy that works regardless of column structure
    CREATE POLICY "Admins can manage all registrations"
    ON event_registrations FOR ALL
    USING (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.jwt() ->> 'role' = 'admin'
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

-- ======== STEP 3: ENSURE USER_ROLES TABLE HAS PROPER POLICIES ========

-- Make sure user_roles policies are correct (from previous fix)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Create user_roles policies
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON user_roles FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR auth.jwt() ->> 'role' = 'admin'
);

-- ======== STEP 4: FIX REGISTRATION_DEADLINE COLUMN TYPE ========

-- Make sure registration_deadline allows NULL values
ALTER TABLE events ALTER COLUMN registration_deadline DROP NOT NULL;

-- ======== STEP 5: DIAGNOSTIC QUERIES ========

-- Check if everything is set up correctly
SELECT 'Events Table Check' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables WHERE table_name = 'events'
       ) THEN 'SUCCESS: events table exists' 
         ELSE 'ERROR: events table missing' 
       END as result
UNION ALL

SELECT 'Current User Admin Check' as check_type,
       CASE 
         WHEN auth.uid() IS NULL THEN 'ERROR: Not logged in'
         WHEN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN 'SUCCESS: Admin via app_metadata'
         WHEN EXISTS (
           SELECT 1 FROM user_roles 
           WHERE user_id = auth.uid() AND role = 'admin'
         ) THEN 'SUCCESS: Admin via user_roles'
         ELSE 'ERROR: User is not admin'
       END as result
UNION ALL

SELECT 'Registration Deadline Column Check' as check_type,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'events' AND column_name = 'registration_deadline' AND is_nullable = 'YES'
       ) THEN 'SUCCESS: registration_deadline allows NULL' 
         ELSE 'INFO: registration_deadline column configuration checked' 
       END as result;

-- ======== STEP 6: ADD ADMIN USER IF NEEDED ========

-- Insert admin role for the main admin user if not exists
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'oluobamzy@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

SELECT 
  'Final Check' as check_type,
  'Event permissions setup complete - Try editing events now!' as result;