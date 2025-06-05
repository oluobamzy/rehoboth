// scripts/checkSermonTables.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Not found');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Not found');

async function checkDatabaseTables() {
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Checking database tables...');
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('exec', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND 
        table_name IN ('sermons', 'sermon_series')
      `
    });
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }
    
    console.log('Tables found:', tables);
    
    // Check sermon count
    const { data: sermonsCount, error: sermonsError } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true });
    
    if (sermonsError) {
      console.error('Error checking sermon count:', sermonsError);
    } else {
      console.log('Sermon count:', sermonsCount.length);
    }
    
    // Check sermon_series count
    const { data: seriesCount, error: seriesError } = await supabase
      .from('sermon_series')
      .select('*', { count: 'exact', head: true });
    
    if (seriesError) {
      console.error('Error checking series count:', seriesError);
    } else {
      console.log('Series count:', seriesCount.length);
    }
    
    console.log('Database check complete');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabaseTables();
