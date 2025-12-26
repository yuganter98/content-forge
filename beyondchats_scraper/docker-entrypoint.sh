#!/bin/sh
set -e

# Create database file if it doesn't exist
if [ ! -f /var/www/database/database.sqlite ]; then
    echo "Creating database.sqlite..."
    touch /var/www/database/database.sqlite
fi


# FORCE IPv4 Resolution for Supabase (Fixes Render IPv6 error)
if [ "$DB_CONNECTION" = "pgsql" ] && [ -n "$DB_HOST" ]; then
    echo "Resolving IPv4 for $DB_HOST..."
    export DB_HOST=$(php -r "echo gethostbyname('$DB_HOST');")
    echo "Resolved DB_HOST to: $DB_HOST"
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start the application
echo "Starting application..."
exec "$@"
