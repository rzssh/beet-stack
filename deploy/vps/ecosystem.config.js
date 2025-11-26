// PM2 ecosystem configuration for VPS deployment
module.exports = {
  apps: [
    {
      name: "elysia-better-auth-api",
      script: "./server",
      cwd: "/home/deploy/elysia-better-auth/apps/server",
      instances: "max", // Use all CPU cores
      exec_mode: "cluster",
      
      // Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      
      // Logging configuration
      error_file: "/home/deploy/logs/elysia-api-error.log",
      out_file: "/home/deploy/logs/elysia-api-out.log",
      log_file: "/home/deploy/logs/elysia-api.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // Performance settings
      max_memory_restart: "1G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      
      // Health monitoring
      health_check_grace_period: 3000,
      
      // Auto-restart configuration
      watch: false, // Set to true for development
      ignore_watch: ["node_modules", "logs", "*.log"],
      
      // Cluster configuration
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      
      // Source map support
      source_map_support: true,
      
      // Custom environment files
      env_file: "/home/deploy/elysia-better-auth/.env",
      
      // Graceful shutdown
      shutdown_with_message: true,
      
      // Monitoring
      monitoring: false, // Set to true if using PM2 monitoring
      
      // Custom restart cron (optional - restart daily at 2 AM)
      cron_restart: "0 2 * * *",
      
      // Autorestart configuration
      autorestart: true,
      
      // Custom startup script (optional)
      post_update: ["bun install", "bun run build"],
      
      // Merge logs
      merge_logs: true,
      
      // Log rotation
      log_type: "json",
      
      // Instance variables (for load balancing)
      instance_var: "INSTANCE_ID",
      
      // Custom environment for production
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        PM2_SERVE_PATH: "/home/deploy/elysia-better-auth/apps/server",
        PM2_SERVE_PORT: 3001,
        PM2_SERVE_SPA: false,
        PM2_SERVE_HOMEPAGE: "/api/health",
      },
      
      // Development environment (for testing)
      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
        DEBUG: "*",
      },
      
      // Staging environment
      env_staging: {
        NODE_ENV: "staging",
        PORT: 3001,
      }
    }
  ],
  
  // Deploy configuration for automated deployment
  deploy: {
    production: {
      user: "deploy",
      host: ["your-server-ip"],
      ref: "origin/main",
      repo: "https://github.com/yourusername/your-repo.git",
      path: "/home/deploy/elysia-better-auth",
      
      // Pre-deployment commands
      "pre-deploy-local": "echo 'Starting deployment to production'",
      
      // Post-receive hook
      "post-deploy": [
        "bun install --frozen-lockfile",
        "cd apps/server",
        "bun run build",
        "pm2 reload ecosystem.config.js --env production",
        "echo 'Deployment completed successfully'"
      ].join(" && "),
      
      // Pre-setup commands (run once)
      "pre-setup": [
        "sudo mkdir -p /home/deploy/logs",
        "sudo chown -R deploy:deploy /home/deploy/logs",
        "sudo mkdir -p /home/deploy/backups",
        "sudo chown -R deploy:deploy /home/deploy/backups"
      ].join(" && "),
      
      // Environment variables file
      env: {
        NODE_ENV: "production"
      }
    },
    
    staging: {
      user: "deploy",
      host: ["staging-server-ip"],
      ref: "origin/develop",
      repo: "https://github.com/yourusername/your-repo.git",
      path: "/home/deploy/elysia-better-auth-staging",
      
      "post-deploy": [
        "bun install --frozen-lockfile",
        "cd apps/server", 
        "bun run build",
        "pm2 reload ecosystem.config.js --env staging"
      ].join(" && "),
      
      env: {
        NODE_ENV: "staging"
      }
    }
  }
};