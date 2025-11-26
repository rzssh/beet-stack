# VPS & Self-Hosted Deployment

Deploy your Elysia Better Auth API on your own VPS server with full control and cost optimization. Perfect for local businesses and organizations requiring data sovereignty.

## Deployment Options

### 1. Coolify (Recommended)
**Self-hosted Vercel/Netlify alternative with Docker support**

### 2. Direct VPS Deployment
**Traditional server setup with PM2 or systemd**

### 3. Caprover
**Self-hosted PaaS with easy scaling**

### 4. Dokku
**Docker-powered mini-Heroku**

---

## Option 1: Coolify Deployment

[Coolify](https://coolify.io) is a self-hosted application deployment platform that makes VPS deployment as easy as Vercel.

### Prerequisites

- VPS with 2GB+ RAM (Ubuntu 20.04+ recommended)
- Docker installed
- Domain name pointed to your server

### Install Coolify

```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Access Coolify dashboard
# Visit https://your-domain:8000
```

### Deploy via Git Repository

1. **Connect Repository**:
   - Add your GitHub/GitLab repository
   - Set build pack to "Docker"
   - Point to `/deploy/docker/Dockerfile`

2. **Environment Variables**:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@coolify-postgres:5432/app
BETTER_AUTH_SECRET=your-secure-secret-here
BETTER_AUTH_URL=https://api.your-domain.com
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

3. **Database Setup**:
   - Create PostgreSQL service in Coolify
   - Connect to your application
   - Auto-backup configured

4. **Domain & SSL**:
   - Add your domain in Coolify
   - Automatic Let's Encrypt SSL
   - CDN integration optional

### Coolify Configuration

Create `coolify.yaml` in project root:

```yaml
# Coolify deployment configuration
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile
    environment:
      NODE_ENV: production
      PORT: 3001
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "coolify.managed=true"
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`api.your-domain.com\`)"
      - "traefik.http.services.app.loadbalancer.server.port=3001"
```

---

## Option 2: Direct VPS Deployment

### Server Requirements

**Minimum**:
- 1 vCPU, 2GB RAM, 20GB SSD
- Ubuntu 20.04 LTS or newer

**Recommended**:
- 2 vCPU, 4GB RAM, 50GB SSD
- Ubuntu 22.04 LTS

### Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install PM2 for process management
npm install -g pm2
```

### Database Setup

```bash
# Configure PostgreSQL
sudo -u postgres psql

CREATE DATABASE elysia_app;
CREATE USER elysia_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE elysia_app TO elysia_user;
\q

# Configure for external connections
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: local elysia_app elysia_user md5

sudo systemctl restart postgresql
```

### Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Install dependencies
bun install

# Build application
cd apps/server
bun run build

# Create environment file
cp ../../.env.example .env
nano .env
# Configure your environment variables

# Create PM2 ecosystem file
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
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/elysia-api

# Add configuration:
server {
    listen 80;
    server_name api.your-domain.com;

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

# Enable site
sudo ln -s /etc/nginx/sites-available/elysia-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate
sudo certbot --nginx -d api.your-domain.com
```

---

## Option 3: Caprover Deployment

[Caprover](https://caprover.com) is a free, self-hosted PaaS.

### Install Caprover

```bash
# On your VPS
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover

# Setup domain and login via web interface
# Visit http://your-server-ip:3000
```

### Deploy Application

1. **Create App** in Caprover dashboard
2. **Set Environment Variables**
3. **Deploy via Git** or **Upload Tar**

Create `captain-definition` file:

```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./deploy/docker/Dockerfile"
}
```

---

## Option 4: Dokku Deployment

[Dokku](https://dokku.com) creates a Heroku-like experience on your VPS.

### Install Dokku

```bash
# Install Dokku on Ubuntu
wget https://raw.githubusercontent.com/dokku/dokku/v0.34.8/bootstrap.sh
sudo DOKKU_TAG=v0.34.8 bash bootstrap.sh

# Configure via web setup: http://your-server-ip
```

### Deploy Application

```bash
# On your local machine
git remote add dokku dokku@your-server-ip:elysia-api
git push dokku main

# Configure environment
ssh dokku@your-server-ip
dokku config:set elysia-api NODE_ENV=production DATABASE_URL=...

# Add domain
dokku domains:add elysia-api api.your-domain.com

# Install SSL
dokku letsencrypt:enable elysia-api
```

---

## Cost Analysis (Monthly)

| Provider | Server | Total Cost* | Features |
|----------|---------|-------------|----------|
| **DigitalOcean** | $12 (2GB) | $15 | Managed backups |
| **Hetzner** | $4 (2GB) | $7 | Best price/performance |
| **Vultr** | $6 (2GB) | $9 | Global locations |
| **Linode** | $12 (2GB) | $15 | Premium network |
| **Local Provider** | $5-20 | $8-25 | Local support |

*Including domain, SSL, backups

---

## Africa-Focused Providers

### 1. **Hetzner** (Germany, good Africa connectivity)
- Excellent performance to Africa
- Competitive pricing
- Solid infrastructure

### 2. **Vultr** (Multiple locations)
- Johannesburg, South Africa datacenter
- Hourly billing
- Good for testing

### 3. **Local Providers**
- **MWEB (South Africa)**: Local support, compliance
- **Liquid Telecom (Africa-wide)**: Regional expertise
- **Seacom (East Africa)**: Fiber connectivity

### 4. **AWS Lightsail** (Cape Town)
- AWS infrastructure
- Simplified pricing
- Easy scaling to full AWS

---

## Monitoring & Maintenance

### System Monitoring

```bash
# Install monitoring stack
sudo apt install -y prometheus node-exporter grafana

# PM2 monitoring
pm2 install pm2-server-monit
pm2 monit

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Automated Backups

```bash
# Database backup script
cat > /home/deploy/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U elysia_user elysia_app > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
EOF

chmod +x /home/deploy/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /home/deploy/backup-db.sh" | crontab -
```

### Auto-deployment

```bash
# Git webhook for auto-deployment
cat > /home/deploy/deploy.sh << 'EOF'
#!/bin/bash
cd /home/deploy/your-repo
git pull origin main
bun install
cd apps/server
bun run build
pm2 restart elysia-api
EOF

chmod +x /home/deploy/deploy.sh
```

---

## Security Hardening

### Firewall Setup

```bash
# UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Fail2Ban Protection

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Add nginx protection
[nginx-http-auth]
enabled = true

sudo systemctl restart fail2ban
```

### Regular Updates

```bash
# Automated security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

This VPS deployment approach gives you maximum control, cost optimization, and data sovereignty while maintaining production-grade reliability and security.