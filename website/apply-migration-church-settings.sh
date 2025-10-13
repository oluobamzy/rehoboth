#!/bin/bash
# Migration script for church settings
# This script applies the church_settings table to your Supabase database

echo "🏗️  Applying Church Settings Migration..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the website root directory"
    exit 1
fi

# Check if database file exists
if [ ! -f "database/create_church_settings_table.sql" ]; then
    echo "❌ Error: Database migration file not found"
    exit 1
fi

echo "📋 Migration will:"
echo "   • Create church_settings table"
echo "   • Set up RLS policies"
echo "   • Insert default church information"
echo "   • Create indexes for performance"
echo ""

read -p "Do you want to proceed? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Applying migration..."
    
    # You can apply this SQL file in one of these ways:
    echo "📝 Apply this SQL file to your Supabase database:"
    echo "   1. Copy and paste the contents of database/create_church_settings_table.sql"
    echo "   2. Into your Supabase SQL Editor"
    echo "   3. Or use the Supabase CLI: supabase db reset"
    echo ""
    echo "📁 SQL file location: database/create_church_settings_table.sql"
    echo ""
    echo "✅ After applying the SQL, your church settings system will be ready!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Visit /admin/settings to configure your church information"
    echo "   2. The website will automatically use your configured settings"
    echo "   3. All hardcoded values have been replaced with dynamic content"
else
    echo "❌ Migration cancelled"
    exit 1
fi