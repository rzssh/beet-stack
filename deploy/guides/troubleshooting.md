# Deployment Troubleshooting Guide

Common issues and solutions for deploying your Elysia Better Auth API across different platforms.

## 🚨 Common Deployment Issues

### 1. Build Failures

#### Issue: "bun: command not found"
```bash
# Railway/Heroku/Vercel
Error: /bin/sh: 1: bun: command not found

# Solution: Ensure Bun is installed in build environment
# For Railway: Use nixpacks.toml to specify Bun version
[providers]
runtime = "bun"

[variables]
BUN_VERSION = "1.3.2"
```

#### Issue: "Module not found"
```bash
# Error: Cannot find module './apps/server/server'

# Solution 1: Check build script in package.json
cd apps/server && bun run build && chmod +x server

# Solution 2: Verify file exists after build
ls -la apps/server/server

# Solution 3: Check build command in deployment config
"buildCommand": "bun install && cd apps/server && bun run build && chmod +x server"
```

#### Issue: "Permission denied" on executable
```bash
# Error: Permission denied when running ./server

# Solution: Make file executable in build step
chmod +x apps/server/server

# Or in Dockerfile:
COPY --chmod=755 --from=builder /app/apps/server/server ./server
```

---

### 2. Environment Variable Issues

#### Issue: Missing Environment Variables
```bash
# Error: BETTER_AUTH_SECRET is required

# Railway Solution:
railway variables set BETTER_AUTH_SECRET="$(openssl rand -hex 32)"

# Docker Solution:
docker run -e BETTER_AUTH_SECRET="your-secret" your-image

# VPS Solution:
echo "BETTER_AUTH_SECRET=your-secret" >> .env
```

#### Issue: OAuth Redirect URL Mismatch
```bash
# Error: "redirect_uri_mismatch" in OAuth flow

# Check Discord Developer Portal settings:
# 1. Go to OAuth2 → General
# 2. Redirect URLs should match exactly:
#    ✅ https://your-deployed-app.com/api/auth/callback/discord
#    ❌ http://your-deployed-app.com/api/auth/callback/discord (no HTTPS)
#    ❌ https://your-deployed-app.com/auth/callback/discord (missing /api)

# Update environment variables:
BETTER_AUTH_URL=https://your-deployed-app.com
```

#### Issue: Database Connection Failed
```bash
# Error: "connect ECONNREFUSED" or "FATAL: password authentication failed"

# Solution 1: Check DATABASE_URL format
postgresql://username:password@host:port/database

# Solution 2: For Railway - use provided DATABASE_URL
railway variables | grep DATABASE_URL

# Solution 3: For VPS - ensure PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql

# Solution 4: Test connection manually
psql "postgresql://username:password@host:port/database"
```

---

### 3. Runtime Errors

#### Issue: "Port already in use"
```bash
# Error: EADDRINUSE: address already in use :::3001

# Solution 1: Check what's using the port
lsof -i :3001
# Kill the process
kill -9 <PID>

# Solution 2: Use different port
PORT=3002 bun run dev

# Solution 3: For Docker
docker ps  # Check running containers
docker stop <container-name>
```

#### Issue: "Cannot GET /" - Routes not working
```bash
# Error: 404 for all routes

# Check 1: Ensure server is actually running
curl http://localhost:3001/api/health

# Check 2: Verify app exports in apps/server/src/app.ts
export { app } from './app';

# Check 3: Check start command
# Should be: cd apps/server && ./server
# Not: bun run apps/server/src/index.ts
```

#### Issue: CORS Errors in Browser
```bash
# Error: "Access to fetch at ... has been blocked by CORS policy"

# Solution: Update CORS configuration in apps/server/src/app.ts
import { cors } from "@elysiajs/cors";

app.use(cors({
  origin: ["https://your-frontend-domain.com", "expo://", "exp://"],
  credentials: true
}))
```

---

### 4. Platform-Specific Issues

#### Railway Issues

**Issue: Build timeout**
```bash
# Error: Build exceeded 10 minute timeout

# Solution: Optimize build process
# In railway.json:
{
  "build": {
    "buildCommand": "bun install --frozen-lockfile && cd apps/server && bun run build"
  }
}

# Or use nixpacks for better caching
```

**Issue: Memory limit exceeded**
```bash
# Error: Process killed due to memory limit

# Solution: Upgrade Railway plan or optimize memory usage
# Check memory usage:
railway usage
```

#### VPS Issues

**Issue: Nginx 502 Bad Gateway**
```bash
# Error: 502 Bad Gateway

# Check 1: Is the app running?
pm2 status

# Check 2: Is it listening on correct port?
netstat -tlnp | grep 3001

# Check 3: Nginx config correct?
sudo nginx -t
sudo systemctl reload nginx

# Check 4: Firewall blocking?
sudo ufw status
sudo ufw allow 3001
```

**Issue: SSL Certificate not working**
```bash
# Error: "Your connection is not private"

# Solution: Renew SSL certificate
sudo certbot renew --nginx
sudo systemctl reload nginx

# Check certificate status
sudo certbot certificates
```

#### Docker Issues

**Issue: Container exits immediately**
```bash
# Error: Container starts then stops

# Check logs
docker logs container-name

# Common issues:
# 1. App crashes on startup
# 2. Wrong CMD in Dockerfile
# 3. Missing environment variables

# Debug by running interactively
docker run -it --entrypoint /bin/sh your-image
```

**Issue: Health check failing**
```bash
# Error: Container marked unhealthy

# Check health endpoint manually
docker exec container-name curl http://localhost:3001/api/health

# Adjust health check timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3
```

#### AWS Issues

**Issue: Lambda cold start timeout**
```bash
# Error: Task timed out after 30.00 seconds

# Solution 1: Increase timeout in serverless.yml
provider:
  timeout: 60

# Solution 2: Use provisioned concurrency
functions:
  api:
    provisionedConcurrency: 2
```

**Issue: ECS service not stabilizing**
```bash
# Error: Service failed to reach steady state

# Check ECS logs
aws logs tail /ecs/elysia-better-auth-api --follow

# Check task definition health check
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:3001/api/health || exit 1"],
  "startPeriod": 60
}
```

---

### 5. Database Issues

#### Issue: Migration failed
```bash
# Error: "relation does not exist"

# Solution: Run migrations manually
# Connect to database and run
bun run db:push

# For Railway
railway connect postgresql
# Then run SQL commands manually
```

#### Issue: Connection pool exhausted
```bash
# Error: "sorry, too many clients already"

# Solution: Configure connection pooling
# In database connection config:
{
  max: 10,
  idleTimeoutMillis: 30000
}
```

#### Issue: SSL connection required
```bash
# Error: "SSL connection required"

# Solution: Add SSL to DATABASE_URL
postgresql://user:pass@host:5432/db?sslmode=require

# For local development
postgresql://user:pass@host:5432/db?sslmode=disable
```

---

## 🔧 Debugging Tools & Commands

### Railway Debugging
```bash
# View deployment logs
railway logs --deployment

# Check environment variables
railway variables

# Connect to database
railway connect postgresql

# Check service status
railway status

# View metrics
railway usage
```

### VPS Debugging
```bash
# Check running processes
pm2 status
pm2 logs elysia-api

# System resources
htop
df -h
free -m

# Network connectivity
netstat -tlnp
ss -tlnp

# Nginx status
sudo systemctl status nginx
sudo nginx -t

# Database status
sudo systemctl status postgresql
```

### Docker Debugging
```bash
# Container logs
docker logs container-name --tail 100 -f

# Execute into running container
docker exec -it container-name /bin/sh

# Check container resources
docker stats

# Inspect container config
docker inspect container-name

# Check networks
docker network ls
docker network inspect bridge
```

### Database Debugging
```bash
# Test connection
psql "postgresql://user:pass@host:port/db"

# Check database exists
\l

# Check tables
\dt

# Check user permissions
\du

# Monitor connections
SELECT * FROM pg_stat_activity;
```

---

## 🚀 Performance Issues

### High Response Times
```bash
# Check 1: Database slow queries
# Add to your app:
import { logger } from "./core/logger";

db.on('query', (query) => {
  if (query.duration > 100) {
    logger.warn({ query: query.sql, duration: query.duration }, 'Slow query');
  }
});

# Check 2: Memory usage
# For Node.js apps:
node --max-old-space-size=2048 ./server

# Check 3: Enable gzip compression in Nginx
gzip on;
gzip_types application/json text/css application/javascript;
```

### High Memory Usage
```bash
# Check memory leaks
# Add to your app:
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB'
  });
}, 30000);
```

### Database Connection Issues
```bash
# Implement connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 📞 Getting Help

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Support: help@railway.app

### VPS Provider Support
- **Hetzner**: https://docs.hetzner.com
- **DigitalOcean**: https://docs.digitalocean.com
- **Vultr**: https://docs.vultr.com

### Community Support
- **Elysia Discord**: https://discord.gg/elysia
- **Bun Discord**: https://discord.gg/bun
- **Stack Overflow**: Tag questions with `elysia`, `bun`, `better-auth`

### Emergency Rollback
```bash
# Railway
railway rollback

# Docker
docker pull previous-image-tag
docker service update --image previous-image service-name

# PM2
pm2 reload ecosystem.config.js

# Git-based deployments
git revert HEAD
git push
```

Remember: Most deployment issues are configuration-related. Double-check environment variables, URLs, and permissions first! 🔍