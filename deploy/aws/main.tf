# AWS ECS/Fargate wiring for BEET Stack.
#
# Example only: `tofu plan`/`apply` would create real AWS resources. Do not run
# it against production without review. It demonstrates the minimal wiring for
# stateless API replicas sharing external PostgreSQL: an ECR-backed task behind
# an ALB health check with target-tracking autoscaling and secret injection.

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for every resource."
}

variable "image" {
  type        = string
  description = "ECR image ref, e.g. <account>.dkr.ecr.<region>.amazonaws.com/beet-stack:latest."
}

variable "database_url_arn" {
  type        = string
  description = "Secrets Manager ARN holding the external RDS DATABASE_URL."
}

variable "auth_secret_arn" {
  type        = string
  description = "Secrets Manager ARN holding AUTH_SECRET (>= 32 characters)."
}

variable "trusted_origins" {
  type        = string
  default     = "https://beet.example"
  description = "Comma-separated TRUSTED_ORIGINS value."
}

variable "desired_count" {
  type        = number
  default     = 2
  description = "Initial ECS task count; autoscaling adjusts this."
}

variable "health_check_path" {
  type        = string
  default     = "/health"
  description = "ALB target-group health check path exposed by the API."
}

variable "cpu_target" {
  type        = number
  default     = 60
  description = "Target-tracking CPU utilization percentage."
}

provider "aws" {
  region = var.region
}

resource "aws_ecs_cluster" "beet" {
  name = "beet-stack"
}

resource "aws_iam_role" "task_exec" {
  name = "beet-stack-task-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "task_exec_secrets" {
  name = "beet-stack-task-exec-secrets"
  role = aws_iam_role.task_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        var.database_url_arn,
        var.auth_secret_arn,
      ]
    }]
  })
}

resource "aws_ecs_task_definition" "beet" {
  family                   = "beet-stack"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name      = "api"
    image     = var.image
    essential = true
    portMappings = [{
      containerPort = 3001
      hostPort      = 3001
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "SERVICE_PORT", value = "3001" },
      { name = "TRUSTED_ORIGINS", value = var.trusted_origins },
    ]
    secrets = [
      { name = "DATABASE_URL", valueFrom = var.database_url_arn },
      { name = "AUTH_SECRET", valueFrom = var.auth_secret_arn },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.beet.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "api"
      }
    }
  }])
}

resource "aws_cloudwatch_log_group" "beet" {
  name              = "/ecs/beet-stack"
  retention_in_days = 14
}

resource "aws_lb_target_group" "beet" {
  name        = "beet-stack"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  health_check {
    enabled             = true
    path                = var.health_check_path
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.beet.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.beet.arn
  }
}

resource "aws_lb" "beet" {
  name               = "beet-stack"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_ecs_service" "beet" {
  name            = "beet-stack"
  cluster         = aws_ecs_cluster.beet.id
  task_definition = aws_ecs_task_definition.beet.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.beet.arn
    container_name   = "api"
    container_port   = 3001
  }

  # External RDS PostgreSQL is shared across replicas; add the security group
  # ingress on the database side so tasks can reach it.
}

resource "aws_appautoscaling_target" "beet" {
  max_capacity       = 6
  min_capacity       = var.desired_count
  resource_id        = "service/${aws_ecs_cluster.beet.name}/${aws_ecs_service.beet.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "beet-stack-cpu-target-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.beet.resource_id
  scalable_dimension = aws_appautoscaling_target.beet.scalable_dimension
  service_namespace  = aws_appautoscaling_target.beet.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.cpu_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_security_group" "alb" {
  name   = "beet-stack-alb"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "tasks" {
  name   = "beet-stack-tasks"
  vpc_id = var.vpc_id
  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

variable "vpc_id" {
  type        = string
  description = "Existing VPC hosting the ALB, tasks, and route to RDS."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnets for the ALB."
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets for Fargate tasks."
}
