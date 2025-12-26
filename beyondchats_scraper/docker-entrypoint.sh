#!/bin/sh
set -e

# Create database file if it doesn't exist
if [ ! -f /var/www/database/database.sqlite ]; then
    echo "Creating database.sqlite..."
    touch /var/www/database/database.sqlite
fi



# FORCE IPv4 Resolution for Supabase (Fixes Render IPv6 error)
if [ "$DB_CONNECTION" = "pgsql" ] && [ -n "$DB_HOST" ]; then
    echo "Attempting to resolve IPv4 for: $DB_HOST"
    
    # Try using PHP gethostbyname as it is strictly IPv4
    RESOLVED_IP=$(php -r "echo gethostbyname('$DB_HOST');")
    
    if [ "$RESOLVED_IP" != "$DB_HOST" ]; then
        echo "Success! Resolved to IPv4: $RESOLVED_IP"
        export DB_HOST="$RESOLVED_IP"
    else
        echo "Warning: gethostbyname returned the hostname. Resolution failed or no IPv4 found."
    fi
fi

# Clear config cache to ensure env vars are picked up
php artisan config:clear

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed Data (Temporary: Run Scraper once)
echo "Seeding data..."
php artisan scrape:beyondchats

# Start the application
echo "Starting application..."
exec "$@"
