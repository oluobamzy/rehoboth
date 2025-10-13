#!/bin/bash

# Database Migration Script for Page Content Columns
# This script will apply the migration to add missing columns

echo "🔄 Applying database migration for page_content table..."

# Read the migration SQL file
MIGRATION_FILE="database/migrate_page_content_columns.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Migration SQL content:"
echo "========================"
cat "$MIGRATION_FILE"
echo "========================"

echo ""
echo "⚠️  Please copy the above SQL and run it in your Supabase SQL Editor"
echo "🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql"
echo ""
echo "After running the migration, your page_content table will have:"
echo "✅ title (TEXT, nullable)"
echo "✅ content_type (TEXT, default 'html')"
echo "✅ is_published (BOOLEAN, default true)"
echo ""
echo "Then restart your development server with: npm run dev"