import { Elysia } from "elysia";
import helmet from "helmet";

// Rate limiting store (in-memory, consider Redis for production clusters)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // time window in milliseconds
  maxRequests: number; // max requests per window
  message?: string;
  skipIf?: (request: Request) => boolean;
}

export function rateLimit(options: RateLimitOptions) {
  return new Elysia({ name: "rateLimit" })
    .onRequest(({ request, set }) => {
      if (options.skipIf && options.skipIf(request)) {
        return;
      }

      const clientId = getClientId(request);
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Clean up old entries
      for (const [key, data] of rateLimitStore) {
        if (data.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }

      const clientData = rateLimitStore.get(clientId) || {
        count: 0,
        resetTime: now + options.windowMs,
      };

      if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + options.windowMs;
      }

      clientData.count++;
      rateLimitStore.set(clientId, clientData);

      if (clientData.count > options.maxRequests) {
        set.status = 429;
        return {
          error: options.message || "Too many requests",
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        };
      }

      // Add rate limit headers
      set.headers = {
        "X-RateLimit-Limit": options.maxRequests.toString(),
        "X-RateLimit-Remaining": Math.max(0, options.maxRequests - clientData.count).toString(),
        "X-RateLimit-Reset": Math.ceil(clientData.resetTime / 1000).toString(),
      };
    });
}

function getClientId(request: Request): string {
  // Use IP + User-Agent for identification (consider using forwarded headers in production)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `${ip}:${userAgent.substring(0, 50)}`;
}

export function securityHeaders() {
  return new Elysia({ name: "security" })
    .onResponse(({ set }) => {
      // Security headers
      set.headers = {
        ...set.headers,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
      };
    });
}

export function cors(options?: {
  origin?: string | string[] | boolean;
  credentials?: boolean;
  methods?: string[];
}) {
  const defaultOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  };
  
  const config = { ...defaultOptions, ...options };
  
  return new Elysia({ name: "cors" })
    .onRequest(({ request, set }) => {
      const origin = request.headers.get("origin");
      
      // Handle preflight requests
      if (request.method === "OPTIONS") {
        set.headers = {
          "Access-Control-Allow-Methods": config.methods.join(", "),
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400", // 24 hours
        };
      }
      
      // Set CORS headers
      if (origin) {
        const allowOrigin = typeof config.origin === "boolean" 
          ? (config.origin ? origin : "false")
          : Array.isArray(config.origin)
          ? config.origin.includes(origin) ? origin : "false"
          : config.origin;
          
        set.headers = {
          ...set.headers,
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Credentials": config.credentials.toString(),
          "Vary": "Origin",
        };
      }
    });
}

export function validateInput() {
  return new Elysia({ name: "validateInput" })
    .onRequest(({ request, set, body }) => {
      // Basic XSS protection for string inputs
      if (typeof body === "object" && body !== null) {
        sanitizeObject(body);
      }
    });
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      // Basic XSS prevention
      obj[key] = obj[key]
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
