FROM php:8.2-cli

# Install dependencies for SQLite and Zip (for Composer)
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libpq-dev \
    git \
    unzip \
    && docker-php-ext-install pdo_sqlite pdo_pgsql zip mbstring xml bcmath curl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy App
COPY . .

# Install Dependencies
RUN rm -f composer.lock
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Setup Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose Port
EXPOSE 8000

# Set Entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Run Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
