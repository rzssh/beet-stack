# Cloud Providers Quick Deploy Guide

Deploy your Elysia Better Auth API across major cloud providers. Each guide assumes you're starting from zero.

## ☁️ AWS Quick Deploy

### Option A: AWS Lambda (Serverless - Fastest)

#### Step 1: Setup AWS Account
```bash
# 1. Sign up: https://aws.amazon.com
# 2. Create IAM user with programmatic access
# 3. Attach policies: AWSLambdaFullAccess, IAMFullAccess, CloudFormationFullAccess

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key, Secret Key, Region (af-south-1 for Africa), Output format (json)
```

#### Step 2: Install Serverless Framework
```bash
npm install -g serverless

# Verify installation
serverless --version
```

#### Step 3: Deploy
```bash
# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo/deploy/aws/lambda

# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="your-neon-or-rds-url"
export BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
export DISCORD_CLIENT_ID="your-discord-id"
export DISCORD_CLIENT_SECRET="your-discord-secret"

# Deploy to Cape Town region
serverless deploy --stage production --region af-south-1

# Note the API Gateway URL from output
```

#### Step 4: Test
```bash
# Test deployment
curl https://your-api-gateway-url.execute-api.af-south-1.amazonaws.com/production/api/health
```

**Total Time**: 20 minutes ⚡

### Option B: AWS ECS Fargate (Containers)

#### Step 1: Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install AWS CLI & configure (same as above)
aws configure
```

#### Step 2: Deploy Infrastructure
```bash
cd deploy/aws/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="region=af-south-1" -var="app_name=elysia-api"

# Apply infrastructure (creates VPC, ECS cluster, RDS, etc.)
terraform apply -var="region=af-south-1" -var="app_name=elysia-api"
# Type 'yes' when prompted

# Note outputs: ECR repository URL, Load Balancer URL
```

#### Step 3: Build & Push Container
```bash
# Get ECR login
aws ecr get-login-password --region af-south-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.af-south-1.amazonaws.com

# Build container
docker build -t elysia-api -f deploy/docker/Dockerfile .

# Tag for ECR
ECR_REPO=$(terraform output -raw ecr_repository_url)
docker tag elysia-api:latest $ECR_REPO:latest

# Push to ECR
docker push $ECR_REPO:latest
```

#### Step 4: Deploy Service
```bash
# Update ECS service to deploy new container
aws ecs update-service \
  --cluster elysia-cluster \
  --service elysia-service \
  --force-new-deployment \
  --region af-south-1

# Check deployment status
aws ecs describe-services \
  --cluster elysia-cluster \
  --services elysia-service \
  --region af-south-1
```

**Total Time**: 45 minutes 🚀

---

## 🔵 Google Cloud Quick Deploy

### Step 1: Setup GCP Account
```bash
# 1. Sign up: https://cloud.google.com
# 2. Create new project
# 3. Enable billing

# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### Step 2: Enable APIs
```bash
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
```

### Option A: Cloud Run (Serverless)
```bash
# Build and deploy
gcloud run deploy elysia-api \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,BETTER_AUTH_SECRET=$(openssl rand -hex 32) \
  --set-env-vars DATABASE_URL=your-database-url \
  --set-env-vars DISCORD_CLIENT_ID=your-discord-id \
  --set-env-vars DISCORD_CLIENT_SECRET=your-discord-secret

# Note the service URL from output
```

### Option B: GKE (Kubernetes)
```bash
# Create GKE cluster
gcloud container clusters create elysia-cluster \
  --num-nodes=2 \
  --machine-type=e2-medium \
  --zone=europe-west1-b

# Get cluster credentials
gcloud container clusters get-credentials elysia-cluster --zone=europe-west1-b

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/elysia-api .

# Deploy to Kubernetes
kubectl create deployment elysia-api --image=gcr.io/PROJECT_ID/elysia-api
kubectl expose deployment elysia-api --type=LoadBalancer --port=80 --target-port=3001
```

**Total Time**: 30 minutes ☁️

---

## 🔷 Azure Quick Deploy

### Step 1: Setup Azure Account
```bash
# 1. Sign up: https://azure.microsoft.com
# 2. Create subscription

# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login
```

### Step 2: Create Resource Group
```bash
# Create resource group in South Africa North (for Africa)
az group create --name elysia-rg --location southafricanorth
```

### Option A: Container Instances (Fastest)
```bash
# Build and push to Azure Container Registry
az acr create --resource-group elysia-rg --name elysiaregistry --sku Basic
az acr login --name elysiaregistry

docker build -t elysia-api .
docker tag elysia-api elysiaregistry.azurecr.io/elysia-api:latest
docker push elysiaregistry.azurecr.io/elysia-api:latest

# Deploy to Container Instances
az container create \
  --resource-group elysia-rg \
  --name elysia-api \
  --image elysiaregistry.azurecr.io/elysia-api:latest \
  --registry-login-server elysiaregistry.azurecr.io \
  --registry-username elysiaregistry \
  --registry-password $(az acr credential show --name elysiaregistry --query "passwords[0].value" -o tsv) \
  --dns-name-label elysia-api-unique \
  --ports 3001 \
  --environment-variables NODE_ENV=production BETTER_AUTH_SECRET=$(openssl rand -hex 32) \
  --secure-environment-variables DATABASE_URL=your-db-url DISCORD_CLIENT_SECRET=your-secret
```

### Option B: App Service
```bash
# Create App Service plan
az appservice plan create --name elysia-plan --resource-group elysia-rg --sku B1 --is-linux

# Create web app
az webapp create \
  --resource-group elysia-rg \
  --plan elysia-plan \
  --name elysia-api-unique-name \
  --deployment-container-image-name elysiaregistry.azurecr.io/elysia-api:latest

# Configure app settings
az webapp config appsettings set \
  --resource-group elysia-rg \
  --name elysia-api-unique-name \
  --settings NODE_ENV=production BETTER_AUTH_SECRET=$(openssl rand -hex 32) DATABASE_URL=your-db-url
```

**Total Time**: 25 minutes 🔷

---

## 🟠 DigitalOcean Quick Deploy

### Step 1: Setup Account
```bash
# 1. Sign up: https://cloud.digitalocean.com
# 2. Generate API token: Settings > API

# Install doctl
snap install doctl
# Or: wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz

# Authenticate
doctl auth init
# Enter your API token
```

### Option A: App Platform (Managed)
```bash
# Create app spec
cat > app.yaml << 'EOF'
name: elysia-better-auth-api
services:
- name: api
  source_dir: /
  github:
    repo: yourusername/your-repo
    branch: main
  run_command: cd apps/server && ./server
  build_command: bun install && cd apps/server && bun run build && chmod +x server
  environment_slug: ubuntu-22
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: BETTER_AUTH_SECRET
    value: your-secret-here
    type: SECRET
databases:
- name: elysia-db
  engine: PG
  version: "15"
EOF

# Deploy app
doctl apps create --spec app.yaml

# Check status
doctl apps list
```

### Option B: Droplet + Docker
```bash
# Create droplet
doctl compute droplet create elysia-api \
  --image docker-20-04 \
  --size s-1vcpu-1gb \
  --region lon1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header)

# Get droplet IP
DROPLET_IP=$(doctl compute droplet get elysia-api --format PublicIPv4 --no-header)

# SSH and deploy
ssh root@$DROPLET_IP "
  git clone https://github.com/yourusername/your-repo.git &&
  cd your-repo &&
  docker-compose -f deploy/docker/docker-compose.prod.yml up -d
"
```

**Total Time**: 15 minutes 🟠

---

## 🟣 Heroku Quick Deploy

### Step 1: Setup Heroku
```bash
# 1. Sign up: https://heroku.com
# 2. Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

### Step 2: Deploy
```bash
# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Create Heroku app
heroku create elysia-api-unique-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set BETTER_AUTH_SECRET=$(openssl rand -hex 32)
heroku config:set DISCORD_CLIENT_ID=your-discord-id
heroku config:set DISCORD_CLIENT_SECRET=your-discord-secret

# Create Procfile for Heroku
echo "web: cd apps/server && ./server" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open
```

**Total Time**: 10 minutes 🟣

---

## 🟡 Vercel (Frontend + Backend)

### Step 1: Setup Vercel
```bash
# 1. Sign up: https://vercel.com
# 2. Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

### Step 2: Deploy Backend
```bash
# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Deploy (follow prompts)
vercel

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add NODE_ENV production
vercel env add BETTER_AUTH_SECRET $(openssl rand -hex 32)
vercel env add DATABASE_URL your-database-url

# Redeploy with env vars
vercel --prod
```

**Total Time**: 8 minutes 🟡

---

## 🟢 Fly.io Quick Deploy

### Step 1: Setup Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Add to PATH
export PATH="$HOME/.fly/bin:$PATH"

# Sign up and login
flyctl auth signup
# Or login: flyctl auth login
```

### Step 2: Deploy
```bash
# Clone and navigate
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Initialize app
flyctl launch --name elysia-api --region jnb --no-deploy

# Add PostgreSQL
flyctl postgres create --name elysia-db --region jnb

# Attach database
flyctl postgres attach --app elysia-api elysia-db

# Set secrets
flyctl secrets set BETTER_AUTH_SECRET=$(openssl rand -hex 32)
flyctl secrets set DISCORD_CLIENT_ID=your-discord-id
flyctl secrets set DISCORD_CLIENT_SECRET=your-discord-secret

# Deploy
flyctl deploy

# Check status
flyctl status
```

**Total Time**: 12 minutes 🟢

---

## 🔴 Oracle Cloud (Free Tier)

### Step 1: Setup Oracle Cloud
```bash
# 1. Sign up: https://cloud.oracle.com (Free tier includes Always Free services)
# 2. Create compartment

# Install OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configure
oci setup config
```

### Step 2: Deploy to Container Instances
```bash
# Build and push to Oracle Container Registry
docker build -t elysia-api .
docker tag elysia-api iad.ocir.io/namespace/elysia-api:latest

# Login to OCIR
docker login iad.ocir.io
# Username: namespace/username, Password: auth token

docker push iad.ocir.io/namespace/elysia-api:latest

# Create container instance via OCI CLI or console
oci container-instances container-instance create \
  --compartment-id your-compartment-id \
  --display-name elysia-api \
  --container-restart-policy ALWAYS \
  --containers '[{
    "displayName": "elysia-api",
    "imageUrl": "iad.ocir.io/namespace/elysia-api:latest",
    "environmentVariables": {
      "NODE_ENV": "production",
      "BETTER_AUTH_SECRET": "your-secret"
    }
  }]'
```

**Total Time**: 30 minutes 🔴

---

## 🚀 Quick Comparison

| Provider | Setup Time | Cost/Month* | Best For |
|----------|------------|-------------|----------|
| **Railway** | 5 min | $5-20 | Quick MVP |
| **Vercel** | 8 min | $0-20 | Frontend+API |
| **Heroku** | 10 min | $0-25 | Traditional apps |
| **Fly.io** | 12 min | $3-15 | Global edge |
| **DigitalOcean** | 15 min | $12-50 | Balanced features |
| **AWS Lambda** | 20 min | $5-100 | Serverless scale |
| **Google Cloud** | 30 min | $10-100 | Enterprise features |
| **Azure** | 25 min | $10-100 | Microsoft integration |
| **Oracle** | 30 min | $0-50 | Free tier generous |

*Estimated for small to medium apps

Each provider has detailed setup instructions above - pick the one that best fits your needs and timeline!