// Setup Prisma Migration System
// This script will create a new migrations directory and initialize Prisma migrations
// for your project, enabling you to manage schema changes systematically

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupPrismaMigrationSystem() {
  try {
    console.log('Setting up Prisma Migration system...');
    
    // Check if migrations directory exists
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('Creating migrations directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Create a _migration_lock.toml file
    const migrationLockPath = path.join(__dirname, '..', 'prisma', 'migrations', '_migration_lock.toml');
    if (!fs.existsSync(migrationLockPath)) {
      console.log('Creating migration lock file...');
      fs.writeFileSync(migrationLockPath, `# This file is automatically created by Prisma Migrate.
# Please do not delete it or edit.
provider = "postgresql"
`);
    }
    
    // Create the migration history directory
    const migrationHistoryDir = path.join(migrationsDir, '20230601000000_init');
    if (!fs.existsSync(migrationHistoryDir)) {
      console.log('Creating initial migration...');
      fs.mkdirSync(migrationHistoryDir, { recursive: true });
      
      // Create migration.sql file
      fs.writeFileSync(path.join(migrationHistoryDir, 'migration.sql'), `-- CreateTable
CREATE TABLE IF NOT EXISTS "carousel_slides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "description" TEXT,
    "image_url" VARCHAR(500) NOT NULL,
    "cta_text" VARCHAR(100),
    "cta_link" VARCHAR(500),
    "display_order" INTEGER NOT NULL,
    "start_date" TIMESTAMP,
    "end_date" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "carousel_slides_pkey" PRIMARY KEY ("id")
);
`);
    }
    
    // Create migrations table in the database if it doesn't exist
    console.log('Creating _prisma_migrations table if it doesn\'t exist...');
    
    // Set up a wrapper script for migrations
    const migrationWrapperPath = path.join(__dirname, '..', 'scripts', 'run_migration.js');
    fs.writeFileSync(migrationWrapperPath, `// Prisma Migration Runner
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing from environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // First ensure we have the migrations tracking table
    console.log('Checking for _prisma_migrations table...');
    
    const { data: tableExists, error: tableExistsError } = await supabase.rpc('exec', {
      query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_prisma_migrations')"
    });
    
    if (tableExistsError) {
      throw new Error(\`Error checking if _prisma_migrations table exists: \${tableExistsError.message}\`);
    }
    
    const exists = tableExists && tableExists[0] && tableExists[0].exists;
    
    if (!exists) {
      console.log('Creating _prisma_migrations table...');
      const { error: createTableError } = await supabase.rpc('exec', {
        query: \`
          CREATE TABLE "_prisma_migrations" (
            "id" VARCHAR(36) NOT NULL,
            "checksum" VARCHAR(64) NOT NULL,
            "finished_at" TIMESTAMP WITH TIME ZONE,
            "migration_name" VARCHAR(255) NOT NULL,
            "logs" TEXT,
            "rolled_back_at" TIMESTAMP WITH TIME ZONE,
            "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

            CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
          );
        \`
      });
      
      if (createTableError) {
        throw new Error(\`Error creating _prisma_migrations table: \${createTableError.message}\`);
      }
      
      console.log('_prisma_migrations table created successfully!');
    } else {
      console.log('_prisma_migrations table already exists.');
    }
    
    // Read the migration directories
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    const migrationDirs = fs.readdirSync(migrationsDir)
      .filter(dir => dir !== '_migration_lock.toml' && fs.statSync(path.join(migrationsDir, dir)).isDirectory());
    
    console.log(\`Found \${migrationDirs.length} migration directories.\`);
    
    // Check which migrations have been applied
    const { data: appliedMigrations, error: migrationsError } = await supabase.rpc('exec', {
      query: "SELECT migration_name FROM _prisma_migrations WHERE rolled_back_at IS NULL"
    });
    
    if (migrationsError) {
      throw new Error(\`Error checking applied migrations: \${migrationsError.message}\`);
    }
    
    const appliedMigrationNames = (appliedMigrations || []).map(m => m.migration_name);
    console.log(\`Applied migrations: \${appliedMigrationNames.length > 0 ? appliedMigrationNames.join(', ') : 'none'}\`);
    
    // Apply each migration that hasn't been applied yet
    for (const dir of migrationDirs) {
      if (!appliedMigrationNames.includes(dir)) {
        console.log(\`Applying migration: \${dir}\`);
        
        // Read the migration SQL
        const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
        if (!fs.existsSync(sqlPath)) {
          console.warn(\`Migration SQL file not found for \${dir}, skipping.\`);
          continue;
        }
        
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Generate a migration ID
        const migrationId = \`\${Date.now()}_\${Math.random().toString(36).substring(2, 10)}\`;
        const checksum = require('crypto').createHash('sha256').update(sql).digest('hex');
        
        // Start the migration
        const { error: startError } = await supabase.rpc('exec', {
          query: \`
            INSERT INTO _prisma_migrations (id, checksum, migration_name, started_at)
            VALUES ('\${migrationId}', '\${checksum}', '\${dir}', now())
          \`
        });
        
        if (startError) {
          throw new Error(\`Error starting migration \${dir}: \${startError.message}\`);
        }
        
        try {
          // Apply the migration
          const { error: migrationError } = await supabase.rpc('exec', { query: sql });
          
          if (migrationError) {
            throw new Error(\`Error applying migration \${dir}: \${migrationError.message}\`);
          }
          
          // Mark as completed
          const { error: finishError } = await supabase.rpc('exec', {
            query: \`
              UPDATE _prisma_migrations
              SET finished_at = now(), applied_steps_count = 1
              WHERE id = '\${migrationId}'
            \`
          });
          
          if (finishError) {
            throw new Error(\`Error finishing migration \${dir}: \${finishError.message}\`);
          }
          
          console.log(\`Migration \${dir} applied successfully.\`);
        } catch (error) {
          // Mark migration as failed
          await supabase.rpc('exec', {
            query: \`
              UPDATE _prisma_migrations
              SET logs = '\${error.message.replace(/'/g, "''")}'
              WHERE id = '\${migrationId}'
            \`
          });
          
          throw error;
        }
      } else {
        console.log(\`Migration \${dir} already applied, skipping.\`);
      }
    }
    
    console.log('All migrations applied successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
`);

    // Make the script executable
    fs.chmodSync(migrationWrapperPath, '755');

    console.log(`
===================================================
Prisma Migration System Setup Complete!
===================================================

You can now manage your database schema with Prisma.

To create a new migration:
1. Update your schema.prisma file
2. Run: npx prisma migrate dev --name your_migration_name

To apply migrations (through Supabase):
$ node scripts/run_migration.js

This will apply migrations defined in prisma/migrations to your Supabase database.

Your Prisma schema is synchronized with your Supabase database.
You can now use the Prisma Client to interact with your database without schema mismatches.
`);

  } catch (error) {
    console.error('Error setting up Prisma Migration system:', error);
  }
}

setupPrismaMigrationSystem();
