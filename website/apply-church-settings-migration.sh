#!/bin/bash

# Script to apply church settings database migration
# Run this script to set up the church_settings table in your Supabase database

echo "Applying church settings database migration..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    echo "You can also run the SQL script manually in your Supabase SQL editor."
    echo "File location: ./database/create_church_settings_table.sql"
    exit 1
fi

# Check if environment variables are set
if [[ -z "$SUPABASE_DB_URL" ]]; then
    echo "Error: SUPABASE_DB_URL environment variable not set."
    echo "Please set your Supabase database connection string:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:[port]/postgres'"
    echo ""
    echo "Alternatively, you can run the SQL script manually in your Supabase SQL editor."
    echo "File location: ./database/create_church_settings_table.sql"
    exit 1
fi

# Apply the migration
echo "Connecting to database..."
psql "$SUPABASE_DB_URL" -f "./database/create_church_settings_table.sql"

if [[ $? -eq 0 ]]; then
    echo "✅ Church settings table created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. The church_settings table has been created with default values"
    echo "2. Access the admin panel at /admin/settings to customize your church information"
    echo "3. All pages (Footer, Contact, etc.) will now use these dynamic settings"
else
    echo "❌ Migration failed. Please check the error messages above."
    echo "You can also run the SQL script manually in your Supabase SQL editor."
    echo "File location: ./database/create_church_settings_table.sql"
fi