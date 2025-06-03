-- auth_logs table SQL for Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON auth_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at);

-- Enable Row Level Security
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read auth logs
CREATE POLICY "Admins can read auth logs"
  ON auth_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to clean up old logs (keep for 30 days)
CREATE OR REPLACE FUNCTION cleanup_auth_logs()
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily at 3 AM (requires pg_cron extension)
-- IMPORTANT: Make sure pg_cron extension is enabled in Supabase
SELECT cron.schedule('0 3 * * *', 'SELECT cleanup_auth_logs();');
