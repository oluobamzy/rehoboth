// Fix carousel columns using Prisma for direct database access
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function fixCarouselColumnsPrisma() {
  try {
    console.log('Connecting to database using Prisma...');
    const prisma = new PrismaClient();
    
    console.log('Checking carousel_slides table structure...');

    // Check if the table exists by attempting to query it
    try {
      await prisma.$queryRaw`SELECT 1 FROM carousel_slides LIMIT 1`;
      console.log('Table carousel_slides exists.');
    } catch (error) {
      console.error('Table carousel_slides does not exist:', error.message);
      console.log('Please run the create_carousel_table.js script first.');
      await prisma.$disconnect();
      return;
    }

    // Check current column structure
    const columns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'carousel_slides'
      AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link')
    `;

    console.log('Column check results:', columns);

    // Fix columns as needed
    if (columns.some(col => col.column_name === 'button_text') && 
        !columns.some(col => col.column_name === 'cta_text')) {
      console.log('Renaming button_text to cta_text...');
      await prisma.$executeRaw`ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text`;
      console.log('Successfully renamed button_text to cta_text');
    } else {
      console.log('No need to rename button_text column (already fixed or named correctly)');
    }

    if (columns.some(col => col.column_name === 'button_link') && 
        !columns.some(col => col.column_name === 'cta_link')) {
      console.log('Renaming button_link to cta_link...');
      await prisma.$executeRaw`ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link`;
      console.log('Successfully renamed button_link to cta_link');
    } else {
      console.log('No need to rename button_link column (already fixed or named correctly)');
    }

    console.log('Column migration completed successfully!');
    console.log('Your carousel slides table now matches the Prisma schema and code expectations.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fixing carousel columns:', error);
  }
}

fixCarouselColumnsPrisma();
