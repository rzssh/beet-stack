# Railway Deployment Setup

Quick guide to deploy the Elysia Better Auth API to Railway and configure OAuth.

## 🚀 Quick Deploy (5 minutes)

### Step 1: Install Railway CLI
```bash
curl -fsSL https://railway.app/install.sh | sh
# Or: npm install -g @railway/cli
```

### Step 2: Login and Deploy
```bash
railway login
railway up
```

### Step 3: Add Database
```bash
railway add postgresql
# ✅ Important: Click "Add" button in Railway dashboard when prompted
# This provisions the database and generates the DATABASE_URL
```

### Step 4: Configure Environment Variables
```bash
# Run the automated setup script
./scripts/setup-railway-production.sh

# Or set manually:
railway variables set NODE_ENV="production"
railway variables set BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
railway variables set BETTER_AUTH_URL="https://your-app.railway.app"
railway variables set CORS_ORIGINS="https://your-app.railway.app,expo://,exp://"
```

### Step 5: Get Your App URL
```bash
railway status
# Note the URL (e.g., https://acmeserver-production.up.railway.app)
```

### Step 6: Update OAuth Providers
1. **Discord**: https://discord.com/developers/applications
   - OAuth2 → Redirects → Add: `https://your-app.railway.app/api/auth/callback/discord`

2. **GitHub** (if using): https://github.com/settings/applications
   - Authorization callback URL: `https://your-app.railway.app/api/auth/callback/github`

### Step 7: Configure Expo App
```bash
# Set your Railway URL in Expo
echo "EXPO_PUBLIC_API_URL=https://your-app.railway.app" > apps/expo/.env
```

### Step 8: Test
```bash
# Health check
curl https://your-app.railway.app/api/health

# Test auth (should redirect to Discord)
open https://your-app.railway.app/api/auth/signin/discord
```

---

## 🔧 Important Notes

### Railway Detection & Variables
- Railway auto-detects your build configuration from `railway.json` and `nixpacks.toml`
- **Critical**: When Railway shows "detected variables", click **"Add"** to provision them
- Variables are only available after clicking "Add" in the Railway dashboard

### Environment Variable Priority
1. Railway dashboard variables (highest)
2. `railway.json` environment settings
3. `nixpacks.toml` variables
4. Default values in code (lowest)

### Common Issues
- **"DATABASE_URL is required"**: Run `railway add postgresql` and click "Add" in dashboard
- **"Service not found"**: Run `railway service` to link to correct service
- **OAuth redirect errors**: Make sure callback URLs match exactly in provider settings

### Database Provisioning
After `railway add postgresql`:
1. Go to Railway dashboard
2. Click "Add" when prompted for the PostgreSQL service
3. Wait 1-2 minutes for provisioning
4. `DATABASE_URL` will automatically appear in variables

---

## 🚀 Production Checklist

- [ ] PostgreSQL database added and provisioned
- [ ] `DATABASE_URL` environment variable exists
- [ ] `BETTER_AUTH_SECRET` set (32+ characters)
- [ ] `BETTER_AUTH_URL` set to your Railway app URL
- [ ] `CORS_ORIGINS` includes your Railway app URL
- [ ] Discord OAuth redirect URL updated
- [ ] Expo app configured with `EXPO_PUBLIC_API_URL`
- [ ] Health check passes: `https://your-app.railway.app/api/health`

---

## 📱 Expo Integration

### Development
```bash
# Expo auto-detects local server at http://localhost:3001
bun dev  # Start local server
cd apps/expo && bun expo start  # Start Expo
```

### Production
```bash
# Expo uses Railway URL from environment variable
echo "EXPO_PUBLIC_API_URL=https://your-railway-app.railway.app" > apps/expo/.env
cd apps/expo && bun expo start
```

### Testing Auth Flow
1. Start Expo app
2. Tap sign-in button
3. Should redirect to Railway server
4. Complete Discord OAuth
5. Redirect back to Expo app with session

---

## 🔍 Debugging

### Check Railway Status
```bash
railway status       # Get deployment info
railway logs         # Check runtime logs  
railway variables    # List environment variables
railway open         # Open dashboard
```

### Debug Script
```bash
./scripts/debug-railway.sh
```

### Common Commands
```bash
railway redeploy     # Force redeploy
railway restart      # Restart service
railway rollback     # Rollback deployment
```