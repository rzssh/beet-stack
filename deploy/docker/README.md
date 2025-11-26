# Docker Deployment

Universal Docker containerization for vendor-agnostic deployment across any cloud provider.

## Quick Start

```bash
# Build and run locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# With external database
DATABASE_URL="postgresql://..." docker-compose -f docker-compose.prod.yml up -d
```

## Container Configuration

### Multi-stage Build
1. **Base**: Bun runtime + system dependencies
2. **Dependencies**: Install npm packages
3. **Build**: Compile application
4. **Runtime**: Minimal production image

### Optimizations
- Bun 1.3.2 for maximum performance
- Alpine Linux for minimal size
- Non-root user for security
- Health checks for reliability
- Multi-architecture support (AMD64, ARM64)

## Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Required Variables
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/app
BETTER_AUTH_SECRET=your-secure-secret-key-here
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

## Cloud Provider Deployment

### DigitalOcean App Platform
```bash
# Push to registry
docker build -t your-registry/elysia-api .
docker push your-registry/elysia-api

# Create app.yaml for DigitalOcean
```

### Google Cloud Run
```bash
# Build and push to GCR
docker build -t gcr.io/PROJECT_ID/elysia-api .
docker push gcr.io/PROJECT_ID/elysia-api

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/elysia-api
```

### Azure Container Instances
```bash
# Create resource group
az group create --name elysia-rg --location eastus

# Create container
az container create \
  --resource-group elysia-rg \
  --name elysia-api \
  --image your-registry/elysia-api \
  --ports 3001 \
  --environment-variables DATABASE_URL="..." \
  --secure-environment-variables BETTER_AUTH_SECRET="..."
```

### Heroku Container Registry
```bash
# Login to Heroku
heroku login
heroku container:login

# Push and release
heroku container:push web --app your-app
heroku container:release web --app your-app
```

### Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy
```

## Monitoring

### Health Checks
- **Path**: `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

### Logging
```bash
# View container logs
docker-compose logs -f api

# Follow specific service
docker logs -f container_name

# Export logs
docker logs container_name > app.log
```

### Metrics
```bash
# Container stats
docker stats

# Resource usage
docker-compose top
```

## Scaling

### Horizontal Scaling
```bash
# Scale to 3 replicas
docker-compose up -d --scale api=3

# Load balancer configuration required
```

### Resource Limits
```yaml
# In docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M
          cpus: "0.25"
```

## Security

### Container Security
- Non-root user (uid: 1001)
- Read-only filesystem where possible
- Minimal attack surface (Alpine Linux)
- No unnecessary packages

### Network Security
- Internal container network
- Exposed ports only where needed
- HTTPS/TLS termination at load balancer

### Secrets Management
```bash
# Docker secrets (Swarm mode)
echo "secret_value" | docker secret create db_password -

# External secret management
docker run --env-file secrets.env your-image
```

## Backup & Recovery

### Database Backups
```bash
# PostgreSQL backup
docker-compose exec db pg_dump -U postgres app > backup.sql

# Restore
docker-compose exec -T db psql -U postgres app < backup.sql
```

### Volume Backups
```bash
# Create backup of volumes
docker run --rm \
  -v elysia_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm \
  -v elysia_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Troubleshooting

### Common Issues

1. **Build Failures**
```bash
# Clear build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

2. **Permission Issues**
```bash
# Check container user
docker-compose exec api whoami

# Fix file permissions
sudo chown -R 1001:1001 ./data
```

3. **Network Issues**
```bash
# Check container network
docker network ls
docker network inspect compose_default

# Test connectivity
docker-compose exec api curl http://db:5432
```

4. **Resource Issues**
```bash
# Check resource usage
docker stats

# Increase memory limits
# Edit docker-compose.yml deploy.resources.limits
```

### Debug Mode
```bash
# Run with debug output
DEBUG=* docker-compose up

# Interactive shell
docker-compose exec api sh

# Debug specific service
docker-compose logs -f api
```

## Performance Optimization

### Image Size
- Current size: ~150MB (Alpine + Bun)
- Multi-stage build reduces size by 60%
- Only production dependencies included

### Build Performance
```bash
# Parallel build
docker-compose build --parallel

# Build with BuildKit
DOCKER_BUILDKIT=1 docker build .
```

### Runtime Performance
- Bun runtime for maximum JavaScript performance
- Minimal Alpine Linux base
- Optimized layer caching
- Health checks prevent unhealthy containers