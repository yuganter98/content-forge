#!/bin/sh
set -e

# Create database file if it doesn't exist
if [ ! -f /var/www/database/database.sqlite ]; then
    echo "Creating database.sqlite..."
    touch /var/www/database/database.sqlite
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start the application
echo "Starting application..."
exec "$@"
