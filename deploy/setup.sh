#!/usr/bin/env bash
set -euo pipefail

# Rhenis Nursing — server setup for 108.61.9.189 (Ubuntu/Debian assumed)
# Run as root or with sudo.

# 1. Node.js 20 LTS + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 2. App
mkdir -p /var/www/rhenis
cd /var/www/rhenis
git clone https://github.com/07055/Rhenis-Nursing.git .
npm ci
npm run build
cp /var/www/rhenis/deploy/ecosystem.config.js /var/www/rhenis/ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 3. Caddy (auto HTTPS)
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# 4. Caddyfile
mkdir -p /etc/caddy
cp /var/www/rhenis/deploy/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

echo "Done. Point your DNS A record for rhenisnursing.com and www at 108.61.9.189"
