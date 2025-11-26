# Neon Database Setup

This project supports both local PostgreSQL (via Docker Compose) and [Neon](https://neon.tech/) cloud database.

## Using Neon Database

1. **Create a Neon Account**
   - Sign up at [neon.tech](https://neon.tech/)
   - Create a new project

2. **Get Connection String**
   - In your Neon dashboard, go to Connection Details
   - Copy the connection string (it looks like: `postgres://username:password@host/database?sslmode=require`)

3. **Update Environment Variables**
   ```bash
   # In .env file, replace the DATABASE_URL:
   DATABASE_URL="postgres://username:password@host/database?sslmode=require"
   ```

4. **Push Database Schema**
   ```bash
   bun db:push
   ```

5. **Seed Database (Optional)**
   ```bash
   bun db:seed
   ```

## Benefits of Neon

- **Serverless**: Scales to zero when not in use
- **Branching**: Create database branches like Git branches
- **Fast**: Built on modern cloud infrastructure
- **Free Tier**: Generous free tier for development
- **Auto-scaling**: Automatically scales based on demand

## Switching Between Local and Neon

To switch between local PostgreSQL and Neon:

### Use Local PostgreSQL:
```bash
# Start local database
docker compose up -d

# Update .env
DATABASE_URL="postgres://postgres:postgres@localhost:5555/naara"
```

### Use Neon:
```bash
# Update .env with your Neon connection string
DATABASE_URL="postgres://username:password@host/database?sslmode=require"
```

Then run migrations:
```bash
bun db:push
```

## Neon Features for Production

- **Read Replicas**: For read-heavy workloads
- **Point-in-time Recovery**: Restore to any point in time
- **Connection Pooling**: Built-in connection pooling
- **Monitoring**: Real-time monitoring and alerts
- **Backup**: Automatic backups
