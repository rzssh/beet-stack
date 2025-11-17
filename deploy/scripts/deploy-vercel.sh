#!/bin/bash
# Deploy frontend to Vercel

set -e

echo "🚀 Deploying frontend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the frontend
echo "🔨 Building frontend..."
bun run --filter=web build

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployed successfully!"
echo "🔗 Your app is live!"
