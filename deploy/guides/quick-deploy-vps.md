# VPS Quick Deploy Guide

Deploy your Elysia Better Auth API on any VPS provider in 30 minutes or less. Perfect for cost optimization and local hosting in Africa.

## 🔥 Option 1: Coolify (Easiest VPS Deploy)

### Step 1: Get a VPS
**Recommended Providers**:

**🌍 Africa-Optimized**:
- **Hetzner** (Germany, great Africa latency): €4.51/month
- **Vultr** (Johannesburg): $6/month
- **DigitalOcean** (London): $12/month

**📱 Quick VPS Setup**:
```bash
# Hetzner (Best price/performance)
# 1. Sign up: https://hetzner.com
# 2. Create server: Ubuntu 22.04, CX21 (2GB RAM)
# 3. Note IP address and root password

# Vultr (Africa datacenter)  
# 1. Sign up: https://vultr.com
# 2. Deploy server: Ubuntu 22.04, Regular Performance, $6/month
# 3. Johannesburg location
```

### Step 2: Install Coolify
```bash
# SSH into your VPS
ssh root@YOUR_SERVER_IP

# Install Coolify (auto-installs Docker, Nginx, etc.)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Setup will take 3-5 minutes
# Access Coolify: http://YOUR_SERVER_IP:8000
```

### Step 3: Initial Coolify Setup
1. **Visit**: `http://YOUR_SERVER_IP:8000`
2. **Create admin account**
3. **Set up server**:
   - Server name: "production"
   - IP: YOUR_SERVER_IP
   - User: root
   - Private key: (generated automatically)

### Step 4: Deploy Your App
1. **Create Project**:
   - Click "Create Resource" → "Git Repository"
   - Repository URL: `https://github.com/yourusername/your-repo.git`
   - Branch: `main`

2. **Configure Build**:
   - Build pack: "Docker"
   - Dockerfile location: `deploy/docker/Dockerfile`
   - Root directory: `/`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   BETTER_AUTH_SECRET=your-32-char-secret
   DISCORD_CLIENT_ID=your-discord-id
   DISCORD_CLIENT_SECRET=your-discord-secret
   ```

4. **Database**:
   - Add Service → PostgreSQL
   - Database name: `elysia_app`
   - Note the connection string

### Step 5: Configure Domain (Optional)
1. **Add Domain in Coolify**:
   - Project settings → Domains
   - Add: `api.yourdomain.com`

2. **Update DNS**:
   ```
   A record: api.yourdomain.com → YOUR_SERVER_IP
   ```

3. **SSL Certificate**:
   - Coolify auto-generates Let's Encrypt SSL
   - Takes 1-2 minutes

### Step 6: Deploy & Test
```bash
# Deploy happens automatically
# Check logs in Coolify dashboard
# Test: https://api.yourdomain.com/api/health
```

**Total Time**: 30 minutes ⚡

---

## 🛠️ Option 2: Manual VPS Setup (Full Control)

### Step 1: Prepare Server
```bash
# SSH into VPS
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# Create deployment user
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Step 2: Install Bun & PM2
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Node.js (for PM2)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### Step 3: Setup Database
```bash
# Configure PostgreSQL
sudo -u postgres psql

-- In PostgreSQL shell:
CREATE DATABASE elysia_app;
CREATE USER deploy WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE elysia_app TO deploy;
\q

# Test connection
psql postgresql://deploy:secure_password_here@localhost:5432/elysia_app
```

### Step 4: Deploy Application
```bash
# Clone your repository
cd /home/deploy
git clone https://github.com/yourusername/your-repo.git elysia-app
cd elysia-app

# Install dependencies
bun install

# Build application
cd apps/server
bun run build
chmod +x server

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://deploy:secure_password_here@localhost:5432/elysia_app
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=https://api.yourdomain.com
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
EOF
```

### Step 5: Configure PM2
```bash
# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'elysia-api',
    script: './server',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the instructions PM2 gives you
```

### Step 6: Configure Nginx
```bash
# Create Nginx config
sudo cat > /etc/nginx/sites-available/elysia-api << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/elysia-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Setup SSL & Firewall
```bash
# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Install SSL certificate
sudo certbot --nginx -d api.yourdomain.com
# Follow prompts to configure auto-renewal
```

### Step 8: Test Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Test health endpoint
curl https://api.yourdomain.com/api/health
```

**Total Time**: 45-60 minutes 🔧

---

## 📍 Provider-Specific Quick Setup

### Hetzner Cloud (Recommended for Africa)
```bash
# 1. Sign up: https://console.hetzner.cloud
# 2. Create project
# 3. Add SSH key
# 4. Create server:
#    - Location: Nuremberg (best Africa latency)
#    - Image: Ubuntu 22.04
#    - Type: CX21 (2 vCPU, 4GB RAM) - €4.51/month
#    - Networking: Enable IPv6

# Quick setup script:
wget https://raw.githubusercontent.com/yourusername/your-repo/main/deploy/vps/hetzner-setup.sh
chmod +x hetzner-setup.sh
./hetzner-setup.sh
```

### Vultr (Johannesburg)
```bash
# 1. Sign up: https://my.vultr.com
# 2. Add SSH key
# 3. Deploy instance:
#    - Server Type: Cloud Compute
#    - Location: Johannesburg
#    - Image: Ubuntu 22.04
#    - Plan: Regular Performance $6/month

# Vultr-optimized setup:
curl -fsSL https://raw.githubusercontent.com/yourusername/your-repo/main/deploy/vps/vultr-setup.sh | bash
```

### DigitalOcean
```bash
# 1. Sign up: https://cloud.digitalocean.com
# 2. Create droplet:
#    - Ubuntu 22.04
#    - Basic plan $12/month (2GB)
#    - London datacenter (good Africa reach)

# One-click deploy:
curl -fsSL https://raw.githubusercontent.com/yourusername/your-repo/main/deploy/vps/digitalocean-setup.sh | bash
```

### Linode (Akamai)
```bash
# 1. Sign up: https://cloud.linode.com
# 2. Create Linode:
#    - Distribution: Ubuntu 22.04
#    - Region: London (best Africa connectivity)
#    - Plan: Shared CPU 2GB - $12/month

# Deploy script:
bash <(curl -s https://raw.githubusercontent.com/yourusername/your-repo/main/deploy/vps/linode-setup.sh)
```

---

## 🌍 Local African Providers

### MWEB (South Africa)
```bash
# 1. Contact MWEB for VPS hosting
# 2. Request Ubuntu 22.04 server
# 3. 2GB RAM, 2 CPU minimum

# Setup after provisioning:
wget https://raw.githubusercontent.com/yourusername/your-repo/main/deploy/vps/local-setup.sh
sudo bash local-setup.sh
```

### Liquid Telecom (Africa-wide)
```bash
# 1. Contact Liquid Telecom
# 2. Choose data center (Lagos, Nairobi, Cape Town)
# 3. Ubuntu 22.04, 2GB+ RAM

# Standard VPS setup applies
```

---

## 🚀 Automated Setup Scripts

### Create Universal Setup Script
```bash
# Create deploy/vps/quick-setup.sh
cat > deploy/vps/quick-setup.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Setting up Elysia Better Auth API..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Setup PostgreSQL
sudo -u postgres createdb elysia_app
sudo -u postgres createuser deploy
sudo -u postgres psql -c "ALTER USER deploy WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elysia_app TO deploy;"

# Clone and build app
git clone https://github.com/yourusername/your-repo.git ~/elysia-app
cd ~/elysia-app
bun install
cd apps/server
bun run build

# Create environment file
echo "✅ Setup complete! Configure your environment variables in ~/elysia-app/apps/server/.env"
echo "📝 Then run: pm2 start ecosystem.config.js"
EOF

chmod +x deploy/vps/quick-setup.sh
```

### Usage:
```bash
# On any fresh Ubuntu VPS:
curl -fsSL https://raw.githubusercontent.com/yourusername/your-repo/main/deploy/vps/quick-setup.sh | bash
```

---

## 🔧 Management Commands

### Daily Operations
```bash
# Check app status
pm2 status

# Restart app
pm2 restart elysia-api

# View logs
pm2 logs elysia-api

# Update app
cd ~/elysia-app
git pull
cd apps/server
bun run build
pm2 restart elysia-api
```

### Database Management
```bash
# Backup database
pg_dump postgresql://deploy:password@localhost:5432/elysia_app > backup_$(date +%Y%m%d).sql

# Restore database
psql postgresql://deploy:password@localhost:5432/elysia_app < backup.sql

# Database shell
psql postgresql://deploy:password@localhost:5432/elysia_app
```

### Monitoring
```bash
# System resources
htop
df -h
free -m

# Application logs
pm2 logs
tail -f /var/log/nginx/access.log
```

This guide gets you from fresh VPS to production deployment in 30 minutes! 🚀