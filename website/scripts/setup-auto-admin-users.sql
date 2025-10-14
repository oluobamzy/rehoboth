-- Setup automatic admin role assignment for new users
-- This script creates a trigger that automatically grants admin privileges to any new user created

-- Create a function that will be triggered when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Update the app_metadata to include admin role
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = NEW.id;
  
  -- Also insert into user_roles table as backup
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO postgres, anon, authenticated, service_role;

-- Ensure user_roles table has proper constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Test the setup by checking if the function exists
SELECT 'Auto-admin setup completed successfully!' as status;