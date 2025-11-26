# Railway Quick Deploy Guide

Deploy your Elysia Better Auth API to Railway in under 10 minutes, even if you've never used Railway before.

## 🚀 Option 1: One-Click Deploy (Fastest)

### Step 1: Deploy Button
Click this button to deploy instantly:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/elysia-better-auth)

### Step 2: Configure Environment Variables
1. **BETTER_AUTH_SECRET**: Generate a 32+ character secret
   ```bash
   # Generate secret
   openssl rand -hex 32
   ```

2. **Discord OAuth**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create new application → OAuth2 → Note Client ID/Secret
   - Add redirect URL: `https://your-railway-app.railway.app/api/auth/callback/discord`

3. **Required Variables**:
   ```
   BETTER_AUTH_SECRET=your-generated-secret-here
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   ```

### Step 3: Deploy & Test
- Railway auto-deploys in ~3 minutes
- Test: Visit `https://your-app.railway.app/api/health`
- Done! ✅

---

## 🔧 Option 2: CLI Deploy (More Control)

### Step 1: Install Railway CLI

**macOS/Linux**:
```bash
curl -fsSL https://railway.app/install.sh | sh
```

**Windows**:
```powershell
iwr -useb https://railway.app/install.ps1 | iex
```

**Alternative (npm)**:
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
# Login via browser
railway login

# Or use API token
railway login --token your-api-token
```

### Step 3: Initialize Project
```bash
# From your project root
cd /path/to/your/elysia-project

# Initialize Railway project
railway init

# Choose:
# 1. "Create new project"
# 2. Enter project name (e.g., "elysia-better-auth-api")
# 3. Select "Empty project"
```

### Step 4: Add Database
```bash
# Add PostgreSQL database
railway add postgresql

# Railway automatically creates DATABASE_URL
railway variables
# You'll see DATABASE_URL listed
```

### Step 5: Set Environment Variables
```bash
# Method 1: One by one
railway variables set BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
railway variables set NODE_ENV="production"

# Method 2: From file
# Create .env.railway file:
cat > .env.railway << 'EOF'
NODE_ENV=production
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=https://your-app.railway.app
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
EOF

# Load from file
railway variables set --from-file .env.railway
```

### Step 6: Configure Build Settings
```bash
# Use existing railway.json or create one
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "bun install --frozen-lockfile && cd apps/server && bun run build && chmod +x server"
  },
  "deploy": {
    "startCommand": "cd apps/server && ./server",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

### Step 7: Deploy
```bash
# Deploy to Railway
railway up

# Monitor deployment
railway logs

# Get app URL
railway status
```

### Step 8: Configure Custom Domain (Optional)
```bash
# Add custom domain
railway domain add api.yourdomain.com

# Railway handles SSL automatically
# Update DNS: CNAME api.yourdomain.com → your-app.railway.app
```

---

## 🔐 OAuth Configuration

### Discord Setup
1. **Go to Discord Developer Portal**:
   - Visit: https://discord.com/developers/applications
   - Click "New Application"

2. **Get Credentials**:
   - Note your "Application ID" (Client ID)
   - Go to OAuth2 → General
   - Copy "Client Secret"

3. **Set Redirect URLs**:
   ```
   https://your-railway-app.railway.app/api/auth/callback/discord
   http://localhost:3001/api/auth/callback/discord (for local dev)
   ```

4. **Update Railway Variables**:
   ```bash
   railway variables set DISCORD_CLIENT_ID="your-client-id"
   railway variables set DISCORD_CLIENT_SECRET="your-client-secret"
   railway variables set BETTER_AUTH_URL="https://your-railway-app.railway.app"
   ```

### Frontend Configuration
Update your frontend to use Railway URL:
```typescript
// In your web app
const API_URL = "https://your-railway-app.railway.app";

// In your Expo app  
const API_URL = "https://your-railway-app.railway.app";
```

---

## 📊 Monitoring & Logs

### View Deployment Logs
```bash
# Live logs
railway logs

# Deployment logs only
railway logs --deployment

# Filter by service
railway logs --service web
```

### Check Status
```bash
# Project overview
railway status

# Resource usage
railway usage

# Environment variables
railway variables
```

### Performance Monitoring
```bash
# View metrics in Railway dashboard
railway open

# Or visit directly
open https://railway.app/project/your-project-id
```

---

## 🔧 Common Commands

### Project Management
```bash
# List projects
railway projects

# Switch project
railway use

# Environment management
railway environment production
railway environment staging
```

### Database Operations
```bash
# Connect to database
railway connect postgresql

# Database shell
railway shell postgresql

# View database info
railway database info
```

### Deployment Management
```bash
# Redeploy
railway redeploy

# Rollback to previous deployment
railway rollback

# Scale (change plan)
railway scale
```

---

## 💡 Pro Tips

### 1. Environment Management
```bash
# Create staging environment
railway environment create staging

# Deploy different branches to different environments
railway environment staging
git checkout develop
railway up

railway environment production  
git checkout main
railway up
```

### 2. Custom Build Commands
```bash
# For monorepos, customize build path
# In railway.json:
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/server && bun install && bun run build"
  }
}
```

### 3. Health Check Configuration
```bash
# Configure health check endpoint
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 4. Resource Optimization
```bash
# Check resource usage
railway usage

# Upgrade plan if needed
railway subscription
```

---

## 🆘 Troubleshooting

### Build Failures
```bash
# Check build logs
railway logs --deployment

# Common issues:
# 1. Missing bun.lockb - run "bun install" locally first
# 2. Path issues - check buildCommand in railway.json
# 3. Memory issues - upgrade Railway plan
```

### Runtime Errors
```bash
# Check runtime logs
railway logs

# Common issues:
# 1. Missing environment variables
railway variables

# 2. Database connection issues
railway connect postgresql
# Test connection manually

# 3. Port binding issues (Railway uses PORT env var)
# Ensure your app uses process.env.PORT
```

### OAuth Issues
```bash
# Verify environment variables
railway variables | grep -E "(DISCORD|BETTER_AUTH)"

# Check Discord redirect URLs match exactly
# Should be: https://your-exact-railway-url.railway.app/api/auth/callback/discord
```

### Performance Issues
```bash
# Check resource usage
railway usage

# Scale up if needed
railway subscription

# Monitor response times in Railway dashboard
```

---

## 📈 Scaling & Production

### Production Checklist
- [ ] Custom domain configured
- [ ] Environment variables secured
- [ ] Health checks working
- [ ] Monitoring enabled
- [ ] Backup strategy planned

### Monitoring Setup
```bash
# Enable Railway metrics
railway metrics enable

# Set up alerts in Railway dashboard
# Configure webhook notifications
```

### Backup Database
```bash
# Connect and backup
railway connect postgresql
pg_dump > backup.sql

# Or use Railway's automatic backups (Pro plan)
```

This guide gets you from zero to deployed in under 10 minutes with Railway!