#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Deployment Script for EsportsDaily..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 1.5 Configure Firewall (Allow Port 8060)
echo "🛡️ Configuring Firewall..."
sudo ufw allow 8060/tcp || echo "⚠️ Could not configure UFW, please check firewall manually."


# 2. Install Docker & Docker Compose (if not installed)
if ! command -v docker &> /dev/null
then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
else
    echo "✅ Docker is already installed."
fi

# 3. Build and Run Containers
echo "🏗️  Building and Starting Containers..."

# NOTE: We use --remove-orphans to clean up undefined containers.
# We DO NOT use -v, so database volumes are PRESERVED.
sudo docker compose down --remove-orphans || true

# Build and start in detached mode
sudo docker compose build --no-cache
sudo docker compose up -d

echo "🔄 Running Database Migrations..."
sudo docker compose exec backend python manage.py makemigrations --noinput
sudo docker compose exec backend python manage.py migrate --noinput

echo "🖌️  Collecting Static Files..."
sudo docker compose exec backend python manage.py collectstatic --noinput

echo "✅ Deployment Complete!"
echo "🌐 Application should be live at: http://$(curl -s ifconfig.me)"
echo "📝 Monitor logs with: sudo docker compose logs -f"
