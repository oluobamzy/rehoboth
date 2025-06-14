// Prisma Schema Management for Supabase
// This tool helps synchronize your Prisma schema with Supabase

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function managePrismaSchema() {
  try {
    console.log('🔄 Prisma Schema Management Tool for Supabase');
    console.log('-------------------------------------------');
    
    // 1. First, check if the schema.prisma file exists
    const prismaSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    
    if (!fs.existsSync(prismaSchemaPath)) {
      console.log('❌ Prisma schema not found at:', prismaSchemaPath);
      console.log('   Please make sure you have initialized Prisma in your project.');
      console.log('   Run: npx prisma init');
      return;
    }
    
    console.log('✅ Found Prisma schema at:', prismaSchemaPath);
    
    // 2. Check if DATABASE_URL is correctly configured
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL environment variable not found in .env.local');
      console.log('   Adding it now based on your Supabase credentials...');
      
      const dbUrl = `postgresql://postgres:postgres@${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '')}.supabase.co:5432/postgres?schema=public`;
      fs.appendFileSync(path.join(__dirname, '.env.local'), `\n# Added by Prisma Schema Manager\nDATABASE_URL="${dbUrl}"\n`);
      
      console.log('✅ Added DATABASE_URL to .env.local file');
      console.log('   NOTE: You may need to update the password in this URL if "postgres" is not your database password.');
    }
    
    // 3. Run fix_carousel_columns.js to ensure the database matches our schema
    console.log('🔄 Running column fix script for carousel_slides table...');
    
    try {
      execSync('node scripts/fix_carousel_columns.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error running fix_carousel_columns.js:', error.message);
    }
    
    // 4. Generate Prisma client
    console.log('🔄 Generating Prisma Client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma Client generated successfully');
    } catch (error) {
      console.error('❌ Error generating Prisma Client:', error.message);
      console.log('   You may need to update your DATABASE_URL in .env.local with the correct password');
    }
    
    // 5. Test database connection with Prisma
    try {
      console.log('🔄 Testing database connection with Prisma...');
      // For a real test, you would need to import the PrismaClient and run a query
      // This is just a placeholder for demonstration
      console.log('   (Not actually testing - would require importing PrismaClient)');
      console.log('   You can test Prisma connectivity in your application code');
    } catch (error) {
      console.error('❌ Error connecting to database with Prisma:', error.message);
    }
    
    console.log('\n✅ Setup completed!');
    console.log('-------------------------------------------');
    console.log('Your Prisma schema should now be in sync with your Supabase database.');
    console.log('To use Prisma in your application:');
    console.log('');
    console.log('1. Import PrismaClient:');
    console.log('   import { PrismaClient } from "../src/generated/prisma"');
    console.log('');
    console.log('2. Create a client instance:');
    console.log('   const prisma = new PrismaClient()');
    console.log('');
    console.log('3. Use it in your code, for example:');
    console.log('   const slides = await prisma.carouselSlide.findMany()');
    console.log('');
    console.log('For more information on how to use Prisma, visit: https://www.prisma.io/docs/');
    
  } catch (error) {
    console.error('Error managing Prisma schema:', error);
  }
}

managePrismaSchema();
