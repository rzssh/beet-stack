# AWS Deployment

Deploy your Elysia Better Auth API on AWS with multiple options optimized for scale and global reach, including Africa deployment via Cape Town region.

## Deployment Options

### 1. Lambda + API Gateway (Serverless)
**Best for**: Variable traffic, pay-per-use, automatic scaling

### 2. ECS Fargate (Containers) 
**Best for**: Consistent traffic, full control, container orchestration

### 3. EC2 + Docker (Traditional)
**Best for**: Custom requirements, cost optimization, maximum control

---

## Option 1: AWS Lambda Deployment

### Prerequisites
- AWS CLI configured
- Serverless Framework installed
- Node.js 20+ and Bun

### Quick Deploy

```bash
# Install Serverless Framework
npm install -g serverless

# Deploy to Lambda
cd deploy/aws/lambda/
npm install
serverless deploy --stage production --region af-south-1
```

### Configuration

1. **Environment Variables**:
```bash
# Set in serverless.yml or AWS Console
DATABASE_URL=postgresql://user:pass@db-host:5432/db
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-api-gateway-url
DISCORD_CLIENT_ID=your-discord-id
DISCORD_CLIENT_SECRET=your-discord-secret
```

2. **Custom Domain** (optional):
```bash
# Create Route53 hosted zone
aws route53 create-hosted-zone --name api.your-domain.com

# Request SSL certificate
aws acm request-certificate --domain-name api.your-domain.com --region af-south-1

# Update serverless.yml with domain configuration
```

### Monitoring
- **CloudWatch Logs**: Automatic log aggregation
- **X-Ray Tracing**: Distributed tracing
- **CloudWatch Metrics**: Lambda performance metrics

---

## Option 2: ECS Fargate Deployment

### Infrastructure Setup (Terraform)

```bash
cd deploy/aws/terraform/

# Initialize Terraform
terraform init

# Plan deployment (Cape Town region)
terraform plan -var="region=af-south-1"

# Apply infrastructure
terraform apply -var="region=af-south-1"
```

### Container Deployment

```bash
# Build and push to ECR
aws ecr get-login-password --region af-south-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.af-south-1.amazonaws.com

# Build container
docker build -t elysia-better-auth -f deploy/docker/Dockerfile .

# Tag for ECR
docker tag elysia-better-auth:latest ACCOUNT_ID.dkr.ecr.af-south-1.amazonaws.com/elysia-better-auth:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.af-south-1.amazonaws.com/elysia-better-auth:latest

# Update ECS service
aws ecs update-service --cluster elysia-cluster --service elysia-better-auth-api-service --force-new-deployment
```

### Load Balancer Configuration
- **Application Load Balancer**: HTTPS termination, health checks
- **Target Groups**: Container health monitoring
- **Auto Scaling**: CPU/memory-based scaling

---

## Option 3: EC2 Deployment

### Instance Setup

```bash
# Launch EC2 instance (Cape Town)
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-your-security-group \
  --subnet-id subnet-your-subnet \
  --region af-south-1 \
  --user-data file://user-data.sh
```

### User Data Script (`user-data.sh`):

```bash
#!/bin/bash
yum update -y
yum install -y docker nginx

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Start Docker
systemctl start docker
systemctl enable docker

# Clone and setup application
git clone https://github.com/yourusername/your-repo.git /opt/elysia-app
cd /opt/elysia-app
bun install
cd apps/server
bun run build

# Create systemd service
cat > /etc/systemd/system/elysia-api.service << 'EOF'
[Unit]
Description=Elysia Better Auth API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/elysia-app/apps/server
ExecStart=/home/ec2-user/.bun/bin/bun ./server
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

systemctl enable elysia-api
systemctl start elysia-api
```

---

## Regional Optimization

### Cape Town (af-south-1) Setup

Perfect for Africa-focused applications:

```bash
# Deploy to Cape Town region
export AWS_DEFAULT_REGION=af-south-1

# RDS in same region for low latency
aws rds create-db-instance \
  --db-instance-identifier elysia-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your-secure-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-your-db-security-group \
  --availability-zone af-south-1a \
  --backup-retention-period 7 \
  --storage-encrypted
```

### Multi-Region Setup

For global reach with Africa optimization:

```bash
# Primary: Cape Town (Africa)
terraform apply -var="region=af-south-1" -var="environment=production-africa"

# Secondary: EU West (Europe)  
terraform apply -var="region=eu-west-1" -var="environment=production-europe"

# Tertiary: US East (Americas)
terraform apply -var="region=us-east-1" -var="environment=production-americas"
```

---

## Database Options

### 1. Amazon RDS PostgreSQL
```bash
# Create RDS instance in Cape Town
aws rds create-db-instance \
  --db-instance-identifier elysia-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --allocated-storage 20 \
  --storage-type gp2 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --region af-south-1
```

### 2. Aurora Serverless v2
```bash
# More cost-effective for variable workloads
aws rds create-db-cluster \
  --db-cluster-identifier elysia-aurora \
  --engine aurora-postgresql \
  --engine-version 16.1 \
  --engine-mode provisioned \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=2 \
  --master-username postgres \
  --region af-south-1
```

### 3. Keep Neon (External)
```bash
# Use existing Neon database (global edge)
# No changes needed, just configure DATABASE_URL
```

---

## Monitoring & Observability

### CloudWatch Setup

```bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name ElysiaBetterAuthAPI \
  --dashboard-body file://cloudwatch-dashboard.json \
  --region af-south-1
```

### Application Performance Monitoring

```javascript
// Install AWS X-Ray SDK in your app
import { AWSXRay } from "aws-xray-sdk-core";

// Add tracing to Elysia app
app.use(xrayPlugin());
```

### Custom Metrics

```javascript
// Custom CloudWatch metrics
import { CloudWatch } from "@aws-sdk/client-cloudwatch";

const cloudwatch = new CloudWatch({ region: "af-south-1" });

// Track custom metrics
await cloudwatch.putMetricData({
  Namespace: "ElysiaBetterAuth",
  MetricData: [{
    MetricName: "UserSignups",
    Value: 1,
    Unit: "Count",
    Timestamp: new Date()
  }]
});
```

---

## Cost Optimization

### Reserved Instances (EC2)
```bash
# Purchase 1-year reserved instance for 40% savings
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id offering-id \
  --instance-count 1
```

### Savings Plans
```bash
# Commit to 1-year compute usage for additional savings
aws savingsplans create-savings-plan \
  --savings-plan-type Compute \
  --term-duration-in-years 1 \
  --payment-option NoUpfront \
  --commitment 10
```

### Auto Scaling Policies

```bash
# ECS Auto Scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/elysia-cluster/elysia-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# CPU-based scaling
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/elysia-cluster/elysia-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## Security Best Practices

### IAM Roles & Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:af-south-1:ACCOUNT:parameter/elysia/*"
      ]
    }
  ]
}
```

### Secrets Management

```bash
# Store secrets in AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "/elysia/better-auth-secret" \
  --value "your-secret-key" \
  --type "SecureString" \
  --region af-south-1

aws ssm put-parameter \
  --name "/elysia/discord-client-secret" \
  --value "your-discord-secret" \
  --type "SecureString" \
  --region af-south-1
```

### Network Security

```bash
# Create VPC with private/public subnets
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region af-south-1

# Security groups with minimal access
aws ec2 create-security-group \
  --group-name elysia-api-sg \
  --description "Elysia API Security Group" \
  --vpc-id vpc-your-vpc-id

# Allow only necessary ports
aws ec2 authorize-security-group-ingress \
  --group-id sg-your-group-id \
  --protocol tcp \
  --port 3001 \
  --source-group sg-load-balancer-sg
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: af-south-1
          
      - name: Build and push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REPOSITORY }}
          docker build -t elysia-api .
          docker tag elysia-api:latest ${{ secrets.ECR_REPOSITORY }}:latest
          docker push ${{ secrets.ECR_REPOSITORY }}:latest
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster elysia-cluster --service elysia-service --force-new-deployment
```

---

## Disaster Recovery

### Automated Backups

```bash
# RDS automated backups (7-day retention)
aws rds modify-db-instance \
  --db-instance-identifier elysia-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"

# Application data backup to S3
aws s3 sync /app/data s3://elysia-backups/$(date +%Y-%m-%d)/
```

### Multi-AZ Deployment

```bash
# RDS Multi-AZ for high availability
aws rds modify-db-instance \
  --db-instance-identifier elysia-db \
  --multi-az \
  --apply-immediately
```

This comprehensive AWS deployment setup provides enterprise-grade infrastructure optimized for African markets while maintaining global accessibility and scalability.