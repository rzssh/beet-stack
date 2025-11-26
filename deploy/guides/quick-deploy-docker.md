# Docker Quick Deploy Guide

Deploy your Elysia Better Auth API using Docker across any platform that supports containers. Universal deployment solution.

## 🐳 Option 1: Local Docker Deploy (Development)

### Step 1: Install Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# macOS
brew install docker
# Or download Docker Desktop

# Windows
# Download Docker Desktop from docker.com
```

### Step 2: Quick Start
```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Start with Docker Compose (includes PostgreSQL)
docker-compose -f deploy/docker/docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test
curl http://localhost:3001/api/health
```

### Step 3: Environment Variables
```bash
# Copy environment template
cp deploy/docker/.env.example .env

# Edit with your values
nano .env
```

**Total Time**: 5 minutes ⚡

---

## 🏭 Option 2: Production Docker Deploy

### Step 1: Production Compose
```bash
# Use production compose file
docker-compose -f deploy/docker/docker-compose.prod.yml up -d

# With external database
DATABASE_URL="postgresql://user:pass@external-db:5432/db" \
docker-compose -f deploy/docker/docker-compose.prod.yml up -d
```

### Step 2: Build Production Image
```bash
# Build optimized production image
docker build -f deploy/docker/Dockerfile -t elysia-api:production .

# Run production container
docker run -d \
  --name elysia-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-database-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  elysia-api:production
```

**Total Time**: 10 minutes 🏭

---

## 📦 Platform-Specific Docker Deployments

### Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud auth configure-docker
docker build -t gcr.io/PROJECT_ID/elysia-api .
docker push gcr.io/PROJECT_ID/elysia-api

# Deploy to Cloud Run
gcloud run deploy elysia-api \
  --image gcr.io/PROJECT_ID/elysia-api \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars NODE_ENV=production,BETTER_AUTH_SECRET=your-secret
```

### Azure Container Instances
```bash
# Create resource group
az group create --name elysia-rg --location eastus

# Create Azure Container Registry
az acr create --resource-group elysia-rg --name elysiaregistry --sku Basic
az acr login --name elysiaregistry

# Build and push
docker build -t elysiaregistry.azurecr.io/elysia-api .
docker push elysiaregistry.azurecr.io/elysia-api

# Deploy to Container Instances
az container create \
  --resource-group elysia-rg \
  --name elysia-api \
  --image elysiaregistry.azurecr.io/elysia-api \
  --cpu 1 --memory 1 \
  --registry-login-server elysiaregistry.azurecr.io \
  --registry-username $(az acr credential show --name elysiaregistry --query username -o tsv) \
  --registry-password $(az acr credential show --name elysiaregistry --query "passwords[0].value" -o tsv) \
  --dns-name-label elysia-api-unique \
  --ports 3001 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables BETTER_AUTH_SECRET=your-secret DATABASE_URL=your-db-url
```

### AWS ECS Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker build -t elysia-api .
docker tag elysia-api:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/elysia-api:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/elysia-api:latest

# Create ECS task definition (use deploy/aws/ecs/task-definition.json)
aws ecs register-task-definition --cli-input-json file://deploy/aws/ecs/task-definition.json

# Create ECS service
aws ecs create-service --cli-input-json file://deploy/aws/ecs/service-definition.json
```

### DigitalOcean App Platform
```bash
# Create app.yaml
cat > app.yaml << 'EOF'
name: elysia-api
services:
- name: api
  source_dir: /
  dockerfile_path: deploy/docker/Dockerfile
  github:
    repo: yourusername/your-repo
    branch: main
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: BETTER_AUTH_SECRET
    value: your-secret
    type: SECRET
databases:
- name: elysia-db
  engine: PG
  version: "15"
EOF

# Deploy
doctl apps create --spec app.yaml
```

---

## 🔧 Docker Optimization

### Multi-Stage Build Optimization
```dockerfile
# Already optimized in deploy/docker/Dockerfile
# Key optimizations:
# 1. Multi-stage build (base, deps, builder, runtime)
# 2. Bun runtime for performance
# 3. Alpine Linux for minimal size
# 4. Non-root user for security
# 5. Health checks for reliability
```

### Build Performance
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker build -f deploy/docker/Dockerfile -t elysia-api .

# Build with cache mount
docker build \
  --cache-from elysia-api:latest \
  -f deploy/docker/Dockerfile \
  -t elysia-api:latest .

# Parallel build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f deploy/docker/Dockerfile \
  -t elysia-api:latest .
```

### Image Size Optimization
```bash
# Check image size
docker images elysia-api

# Analyze layers
docker history elysia-api

# Use dive for detailed analysis
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest elysia-api
```

---

## 🌐 Container Orchestration

### Docker Swarm (Simple Orchestration)
```bash
# Initialize swarm
docker swarm init

# Create stack file
cat > docker-stack.yml << 'EOF'
version: '3.8'
services:
  api:
    image: elysia-api:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    secrets:
      - better_auth_secret
      - database_url
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

secrets:
  better_auth_secret:
    external: true
  database_url:
    external: true
EOF

# Create secrets
echo "your-secret" | docker secret create better_auth_secret -
echo "your-db-url" | docker secret create database_url -

# Deploy stack
docker stack deploy -c docker-stack.yml elysia
```

### Kubernetes (Advanced Orchestration)
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elysia-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: elysia-api
  template:
    metadata:
      labels:
        app: elysia-api
    spec:
      containers:
      - name: elysia-api
        image: elysia-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: elysia-secrets
              key: auth-secret
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: elysia-secrets
              key: database-url
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: elysia-api-service
spec:
  selector:
    app: elysia-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

```bash
# Create secrets
kubectl create secret generic elysia-secrets \
  --from-literal=auth-secret=your-secret \
  --from-literal=database-url=your-db-url

# Deploy
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods
kubectl get services
```

---

## 🔍 Container Registry Options

### Docker Hub (Public)
```bash
# Build and tag
docker build -t yourusername/elysia-api .

# Login and push
docker login
docker push yourusername/elysia-api

# Pull and run anywhere
docker run -d -p 3001:3001 yourusername/elysia-api
```

### GitHub Container Registry
```bash
# Login with GitHub token
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# Tag and push
docker tag elysia-api ghcr.io/yourusername/elysia-api:latest
docker push ghcr.io/yourusername/elysia-api:latest

# Use in deployments
docker pull ghcr.io/yourusername/elysia-api:latest
```

### Private Registry (Self-Hosted)
```bash
# Run private registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Tag and push
docker tag elysia-api localhost:5000/elysia-api
docker push localhost:5000/elysia-api

# Use in production
docker pull your-registry.com:5000/elysia-api
```

---

## 🚀 CI/CD with Docker

### GitHub Actions
```yaml
# .github/workflows/docker-deploy.yml
name: Build and Deploy Docker

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./deploy/docker/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Deploy to production
        run: |
          # Deploy to your platform
          # Example: Update Kubernetes deployment
          kubectl set image deployment/elysia-api elysia-api=ghcr.io/${{ github.repository }}:latest
```

### GitLab CI/CD
```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -f deploy/docker/Dockerfile -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker stop elysia-api || true
    - docker rm elysia-api || true
    - docker run -d --name elysia-api -p 3001:3001 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

---

## 🔒 Security Best Practices

### Runtime Security
```bash
# Run as non-root user (already in Dockerfile)
USER bun

# Read-only filesystem
docker run --read-only --tmpfs /tmp elysia-api

# Drop capabilities
docker run --cap-drop=ALL elysia-api

# Use secrets for sensitive data
docker run --secret auth_secret elysia-api
```

### Image Security
```bash
# Scan for vulnerabilities
docker scout cves elysia-api

# Use specific base image versions
FROM oven/bun:1.3.2-alpine  # Not 'latest'

# Multi-stage builds to reduce attack surface
# (Already implemented in our Dockerfile)
```

### Network Security
```bash
# Create custom network
docker network create elysia-network

# Run containers in custom network
docker run --network elysia-network elysia-api
```

---

## 📊 Monitoring & Logging

### Container Monitoring
```bash
# Real-time stats
docker stats

# Resource usage
docker system df
docker system prune  # Cleanup

# Container health
docker inspect elysia-api | jq '.[0].State.Health'
```

### Centralized Logging
```bash
# ELK Stack example
docker run -d --name elasticsearch elasticsearch:8.7.0
docker run -d --name kibana --link elasticsearch:elasticsearch kibana:8.7.0
docker run -d --name logstash logstash:8.7.0

# Configure logstash to collect container logs
docker run --log-driver=syslog --log-opt syslog-address=tcp://logstash:5000 elysia-api
```

### Health Monitoring
```bash
# Custom health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# External monitoring with curl
*/5 * * * * curl -f http://your-app.com/api/health || echo "Health check failed" | mail -s "Alert" admin@yoursite.com
```

Docker provides the most flexible deployment option - build once, run anywhere! 🐳