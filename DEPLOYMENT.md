# 🚀 GetBachat.com - Production VPS Deployment Guide

This document provides complete, step-by-step instructions for deploying **GetBachat.com** to any Linux VPS server (Hostinger, DigitalOcean, Hetzner, Contabo, AWS EC2, Linode, Ubuntu/Debian).

Our application is pre-configured with **Next.js Standalone Output Mode** (`output: "standalone"` in `next.config.ts`), which creates an ultra-compact server bundle optimized for VPS hosting with minimal RAM consumption.

---

## 📋 Table of Contents
1. [Server Prerequisites](#1-server-prerequisites)
2. [Option A: Standalone Node.js + PM2 Deployment (Recommended)](#2-option-a-standalone-nodejs--pm2-deployment-recommended)
3. [Option B: Docker Deployment (Alternative)](#3-option-b-docker-deployment-alternative)
4. [Nginx Reverse Proxy & Free SSL Setup](#4-nginx-reverse-proxy--free-ssl-setup)
5. [Connecting Partner Webhooks](#5-connecting-partner-webhooks)
6. [Maintenance & Zero-Downtime Updates](#6-maintenance--zero-downtime-updates)

---

## 1. Server Prerequisites

Ensure your Linux VPS is running **Ubuntu 22.04 LTS / 24.04 LTS** or **Debian 12** and has root or sudo privileges.

### Install Node.js v20 (LTS), Git, and Nginx:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Git, Nginx, and curl
sudo apt install -y git nginx curl build-essential

# Install Node.js v20 (LTS) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v   # Should output v20.x.x
npm -v    # Should output 10.x.x
```

---

## 2. Option A: Standalone Node.js + PM2 Deployment (Recommended)

PM2 is an industry-standard process manager for Node.js that keeps your app running 24/7 in cluster mode and automatically restarts it if the server reboots or crashes.

### Step 1: Install PM2 Globally
```bash
sudo npm install -g pm2
```

### Step 2: Clone Repository & Build Standalone Package
```bash
# Create directory for web apps
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Clone your git repository onto the VPS
git clone https://github.com/yourusername/get_bachat.git /var/www/getbachat
cd /var/www/getbachat

# Install exact dependencies
npm ci

# Create production environment variables file
cat <<EOT > .env.production
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_ROUTING_MODE=CUELINKS
# Add your backend database or API secrets here:
EOT

# Build Next.js application (generates .next/standalone)
npm run build
```

### Step 3: Copy Static Files to Standalone Folder
Next.js standalone mode requires copying public static assets into the standalone directory:
```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### Step 4: Start the Application with PM2
We have included a production `ecosystem.config.js` file in the root directory:
```bash
# Start the application in cluster mode
pm2 start ecosystem.config.js

# Check status of running instances
pm2 status

# Save PM2 process list so it persists across server reboots
pm2 save

# Generate and run startup script for systemd
sudo pm2 startup
# (Run the generated command output by the above terminal instruction)
```

Your Next.js server is now running internally on `http://127.0.0.1:3000`!

---

## 3. Option B: Docker Deployment (Alternative)

If you prefer containerized hosting, we have provided an optimized multi-stage Alpine `Dockerfile` and `.dockerignore`.

### Step 1: Install Docker on VPS
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 2: Build & Run Container
```bash
cd /var/www/getbachat

# Build Docker image
docker build -t getbachat:latest .

# Run container in background on port 3000 with auto-restart enabled
docker run -d \
  --name getbachat_app \
  --restart always \
  -p 3000:3000 \
  -e NEXT_PUBLIC_ROUTING_MODE=CUELINKS \
  getbachat:latest

# Check container status
docker ps
```

---

## 4. Nginx Reverse Proxy & Free SSL Setup

To serve `https://getbachat.com` on ports 80/443 with automatic Let's Encrypt SSL certificates, configure Nginx as a reverse proxy pointing to port `3000`.

### Step 1: Create Nginx Site Configuration
Create a new configuration file `/etc/nginx/sites-available/getbachat.com`:

```bash
sudo nano /etc/nginx/sites-available/getbachat.com
```

Paste the following configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name getbachat.com www.getbachat.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for link processing if needed
        proxy_read_timeout 60s;
    }
}
```

### Step 2: Enable Configuration & Test Nginx
```bash
# Enable the site by creating a symlink
sudo ln -s /etc/nginx/sites-available/getbachat.com /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Reload Nginx service
sudo systemctl reload nginx
```

### Step 3: Generate Free SSL Certificate with Certbot
```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate and automatically configure HTTP -> HTTPS redirect
sudo certbot --nginx -d getbachat.com -d www.getbachat.com
```
When prompted, select option `2` to automatically redirect all HTTP traffic to HTTPS!

---

## 5. Connecting Partner Webhooks

Once your site is live at `https://getbachat.com`, configure your affiliate network webhooks to automate reward point attribution:

1. Log in to your partner network dashboard.
2. Go to **API / Webhook / Postback Settings**.
3. Set your **Transaction Postback URL** to:
   ```http
   https://getbachat.com/api/webhooks/cuelinks
   ```
4. **How it works**: Whenever a user completes an order on Amazon India or Flipkart using your generated link, the partner server sends an HTTP postback containing the user's Account ID (`subid`), transaction amount, and status directly to your endpoint to deposit Bachat Reward Points!

---

## 6. Maintenance & Zero-Downtime Updates

### To update your application with new code changes:
```bash
cd /var/www/getbachat

# 1. Pull latest code from Git
git pull origin main

# 2. Re-install dependencies if package.json changed
npm ci

# 3. Re-build production standalone bundle
npm run build

# 4. Copy updated static assets
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Reload PM2 processes with ZERO downtime!
pm2 reload getbachat
```

### Helpful Monitoring Commands:
```bash
# View real-time application console logs
pm2 logs getbachat

# View live CPU / Memory dashboard
pm2 monit

# Check Nginx access and error logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---
*GetBachat.com VPS Deployment Guide • Pre-configured for high speed, reliability & ad-blocker immunity.*
