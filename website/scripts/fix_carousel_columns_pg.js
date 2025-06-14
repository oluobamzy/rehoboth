// Fix carousel columns using pg direct connection
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

// Print environment variables for debugging (excluding sensitive values)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'undefined');

async function fixCarouselColumnsDirectSQL() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Checking carousel_slides table structure...');

    // Check if the table exists
    const tableCheckResult = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carousel_slides')"
    );
    
    if (!tableCheckResult.rows[0].exists) {
      console.error('Table carousel_slides does not exist');
      console.log('Please run the create_carousel_table.js script first.');
      await client.end();
      return;
    }

    console.log('Table carousel_slides exists. Checking column structure...');

    // Check current column structure
    const columnsResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'carousel_slides'
      AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link')
    `);

    const columns = columnsResult.rows;
    console.log('Column check results:', columns);

    // Fix columns as needed
    if (columns.some(col => col.column_name === 'button_text') && 
        !columns.some(col => col.column_name === 'cta_text')) {
      console.log('Renaming button_text to cta_text...');
      await client.query('ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text');
      console.log('Successfully renamed button_text to cta_text');
    } else {
      console.log('No need to rename button_text column (already fixed or named correctly)');
    }

    if (columns.some(col => col.column_name === 'button_link') && 
        !columns.some(col => col.column_name === 'cta_link')) {
      console.log('Renaming button_link to cta_link...');
      await client.query('ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link');
      console.log('Successfully renamed button_link to cta_link');
    } else {
      console.log('No need to rename button_link column (already fixed or named correctly)');
    }

    console.log('Column migration completed successfully!');
    console.log('Your carousel slides table now matches the Prisma schema and code expectations.');

  } catch (error) {
    console.error('Error fixing carousel columns:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

fixCarouselColumnsDirectSQL();
