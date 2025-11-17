#!/bin/bash
# Deploy to self-hosted VPS (Coolify compatible)

set -e

echo "🚀 Deploying to self-hosted environment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
else
    echo "❌ .env.production not found. Please create one with production variables."
    exit 1
fi

# Build the application
echo "🔨 Building application..."
bun run build

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "🚀 Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
echo "🏥 Waiting for health checks..."
sleep 30

# Check if services are healthy
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application deployed successfully!"
    echo "🔗 Your app is running at: http://localhost"
else
    echo "❌ Health check failed. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
