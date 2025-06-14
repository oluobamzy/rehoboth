// Complete test for carousel functionality
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Prisma client
const prisma = new PrismaClient();

async function testCarouselFunctionality() {
  try {
    console.log('Starting comprehensive carousel test...');
    
    // Step 1: Check and fix column names using Supabase
    await checkAndFixColumnNames();
    
    // Step 2: Test direct insertion using Supabase
    await testDirectInsertion();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkAndFixColumnNames() {
  console.log('Checking carousel_slides table column structure...');
  
  try {
    // First check if the table columns
    const { data: columns, error: columnError } = await supabase
      .rpc('exec', {
        query: `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'carousel_slides'
          AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link')
        `
      });
      
    if (columnError) {
      console.error('Error checking columns using RPC:', columnError);
      // Fall back to direct SQL
      return await fixColumnsDirectly();
    }
    
    if (!columns || !Array.isArray(columns)) {
      console.error('Unexpected column query result format:', columns);
      return await fixColumnsDirectly();
    }
    
    // Process columns
    const columnNames = columns.map(col => col.column_name);
    console.log('Found columns:', columnNames);
    
    if (columnNames.includes('button_text') && !columnNames.includes('cta_text')) {
      console.log('Renaming button_text to cta_text...');
      await renameColumn('button_text', 'cta_text');
    }
    
    if (columnNames.includes('button_link') && !columnNames.includes('cta_link')) {
      console.log('Renaming button_link to cta_link...');
      await renameColumn('button_link', 'cta_link');
    }
    
    // Verify changes
    const { data: updatedColumns } = await supabase
      .rpc('exec', {
        query: `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'carousel_slides'
          AND column_name IN ('cta_text', 'cta_link')
        `
      });
      
    console.log('Updated columns:', updatedColumns.map(col => col.column_name));
  } catch (error) {
    console.error('Error in checkAndFixColumnNames:', error);
    await fixColumnsDirectly();
  }
}

async function renameColumn(oldName, newName) {
  try {
    const { error } = await supabase.rpc('exec', {
      query: `ALTER TABLE carousel_slides RENAME COLUMN ${oldName} TO ${newName};`
    });
    
    if (error) {
      throw new Error(`Failed to rename ${oldName}: ${error.message}`);
    }
    console.log(`Successfully renamed ${oldName} to ${newName}`);
  } catch (error) {
    console.error(`Error renaming ${oldName} to ${newName}:`, error);
    throw error;
  }
}

async function fixColumnsDirectly() {
  console.log('Attempting to fix columns using PL/pgSQL block...');
  
  try {
    const { error } = await supabase.rpc('exec', {
      query: `
        DO $$
        BEGIN
          BEGIN
            ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text;
          EXCEPTION
            WHEN undefined_column THEN
              NULL;
            WHEN duplicate_column THEN
              NULL;
          END;
          
          BEGIN
            ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link;
          EXCEPTION
            WHEN undefined_column THEN
              NULL;
            WHEN duplicate_column THEN
              NULL;
          END;
        END $$;
      `
    });
    
    if (error) {
      console.error('Error in PL/pgSQL column renaming:', error);
      throw error;
    }
    
    console.log('Column renaming block executed');
  } catch (error) {
    console.error('Failed to fix columns directly:', error);
    throw error;
  }
}

async function testDirectInsertion() {
  console.log('Testing direct slide insertion via Supabase...');
  
  try {
    const slideData = {
      title: 'Comprehensive Test Slide',
      subtitle: 'This is a test slide for comprehensive testing',
      image_url: 'https://example.com/image.jpg',
      cta_text: 'Learn More',
      cta_link: 'https://example.com',
      display_order: 3,
      is_active: true,
      start_date: null, // Explicitly null to avoid timestamp errors
      end_date: null    // Explicitly null to avoid timestamp errors
    };
    
    console.log('Inserting slide with data:', slideData);
    
    const { data, error } = await supabase
      .from('carousel_slides')
      .insert([slideData])
      .select();
      
    if (error) {
      console.error('Error inserting slide:', error);
      throw error;
    }
    
    console.log('Slide inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to insert slide:', error);
    throw error;
  }
}

// Run the test
testCarouselFunctionality();
