#!/bin/bash
# Deploy backend to Railway

set -e

echo "🚀 Deploying backend to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Build the backend
echo "🔨 Building backend..."
bun run --filter=backend build

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway up --service backend

echo "✅ Backend deployed successfully!"
echo "🔗 Check your deployment at: https://railway.app"
