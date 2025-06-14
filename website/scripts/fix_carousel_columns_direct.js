// Direct fix for carousel columns using pg directly
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function fixCarouselColumns() {
  let pool;
  
  try {
    // Force output to help diagnose issues
    console.log('Starting column fix script...');
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('Error: DATABASE_URL environment variable is not defined');
      console.log('Checking for Supabase URL and key...');
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Error: Supabase credentials are also missing');
        return;
      }
      
      // Construct DATABASE_URL from Supabase credentials
      // Format: postgres://postgres:[SERVICE_ROLE_KEY]@[PROJECT_REF].supabase.co:5432/postgres
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
      process.env.DATABASE_URL = `postgres://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;
      console.log('Constructed DATABASE_URL from Supabase credentials');
    }
    
    console.log('Connecting to database...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // First check if the carousel_slides table exists
    console.log('Checking if carousel_slides table exists...');
    const tableCheck = await pool.query(`
      SELECT to_regclass('public.carousel_slides') IS NOT NULL as exists;
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Table carousel_slides does not exist. Please create it first.');
      return;
    }
    
    // Check column names
    console.log('Checking column names...');
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'carousel_slides'
      AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link');
    `);
    
    console.log('Found columns:', columnCheck.rows.map(row => row.column_name).join(', '));
    
    const columnNames = columnCheck.rows.map(row => row.column_name);
    
    if (columnNames.includes('button_text') && !columnNames.includes('cta_text')) {
      console.log('Renaming button_text to cta_text...');
      await pool.query('ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text;');
      console.log('Successfully renamed button_text to cta_text');
    }
    
    if (columnNames.includes('button_link') && !columnNames.includes('cta_link')) {
      console.log('Renaming button_link to cta_link...');
      await pool.query('ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link;');
      console.log('Successfully renamed button_link to cta_link');
    }
    
    // Verify the changes
    const verifyCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'carousel_slides'
      AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link');
    `);
    
    console.log('Final columns:', verifyCheck.rows.map(row => row.column_name).join(', '));
    console.log('Column migration completed successfully!');
    
  } catch (error) {
    console.error('Error fixing carousel columns:', error);
  } finally {
    if (pool) {
      console.log('Closing database connection...');
      await pool.end();
    }
  }
}

// Run the function with more detailed error catching
(async () => {
  try {
    await fixCarouselColumns();
  } catch (err) {
    console.error('Top-level error:', err);
  }
})();
