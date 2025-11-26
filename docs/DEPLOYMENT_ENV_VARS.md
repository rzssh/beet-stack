# Platform-Specific Environment Variables

Required environment variables for each deployment platform.

## 🚂 Railway

```bash
# Required
NODE_ENV=production
DATABASE_URL=<auto-provided by Railway PostgreSQL>
BACKEND_URL=https://your-app.railway.app
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Optional but recommended
CORS_ORIGINS=https://your-app.railway.app,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://your-app.railway.app,expo://,exp://
```

**Note**: Railway provides `RAILWAY_PUBLIC_DOMAIN` but you should explicitly set `BACKEND_URL` using your full URL.

---

## 🔺 Vercel

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
BACKEND_URL=https://your-app.vercel.app
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Optional but recommended
CORS_ORIGINS=https://your-app.vercel.app,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://your-app.vercel.app,expo://,exp://
```

**Note**: Vercel provides `VERCEL_URL` but you should explicitly set `BACKEND_URL`.

---

## 🐋 Docker

```bash
# .env file or docker run -e
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@db:5432/app
BACKEND_URL=https://api.yourdomain.com
BETTER_AUTH_SECRET=your-32-char-secret

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# CORS
CORS_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com,expo://,exp://
```

---

## ☁️ AWS (Lambda/ECS/EC2)

```bash
# Set in Parameter Store or Environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/db
BACKEND_URL=https://api.yourdomain.com
BETTER_AUTH_SECRET=your-32-char-secret

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# CORS
CORS_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com,expo://,exp://

# AWS-specific (if using S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

---

## 🟢 Fly.io

```bash
# Set with: flyctl secrets set KEY=value
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
BACKEND_URL=https://your-app.fly.dev
BETTER_AUTH_SECRET=your-32-char-secret

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# CORS
CORS_ORIGINS=https://your-app.fly.dev,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://your-app.fly.dev,expo://,exp://
```

---

## 🟣 Heroku

```bash
# Set with: heroku config:set KEY=value
NODE_ENV=production
DATABASE_URL=<auto-provided by Heroku Postgres>
BACKEND_URL=https://your-app.herokuapp.com
BETTER_AUTH_SECRET=your-32-char-secret

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# CORS
CORS_ORIGINS=https://your-app.herokuapp.com,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://your-app.herokuapp.com,expo://,exp://
```

---

## 💻 VPS (Direct Server)

```bash
# /home/deploy/your-app/.env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://deploy:pass@localhost:5432/app
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
BETTER_AUTH_SECRET=your-32-char-secret

# OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# CORS
CORS_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com,expo://,exp://
BETTER_AUTH_TRUSTED_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com,expo://,exp://

# Optional services
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
```

---

## 📱 Expo App Configuration

For all platforms, update your Expo app:

```bash
# apps/expo/.env
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 🔑 OAuth Callback URLs

For each platform, update your OAuth provider with the correct callback URL:

**Discord**: `https://your-backend-url.com/api/auth/callback/discord`
**GitHub**: `https://your-backend-url.com/api/auth/callback/github`
**Google**: `https://your-backend-url.com/api/auth/callback/google`

---

## 💡 Tips

1. **Always set `BACKEND_URL`** explicitly to your deployed URL
2. **Generate secure secrets**: Use `openssl rand -hex 32` for `BETTER_AUTH_SECRET`
3. **Include Expo origins**: Always add `expo://,exp://` to CORS and trusted origins
4. **Test locally first**: Set these in `.env` file for local testing before deployment
5. **Use platform secrets**: Never commit sensitive values to git

## 🧪 Testing

After setting environment variables, test your deployment:

```bash
# Health check
curl https://your-backend-url.com/api/health

# Check auth config (in logs)
# Should show: baseUrl: "https://your-backend-url.com"
```