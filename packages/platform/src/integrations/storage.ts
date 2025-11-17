import { createHash, createHmac } from "crypto";
import { env } from "../config/env";

const isConfigured =
  Boolean(env.AWS_S3_BUCKET) &&
  Boolean(env.AWS_ACCESS_KEY_ID) &&
  Boolean(env.AWS_SECRET_ACCESS_KEY);

const assertStorage = () => {
  if (!isConfigured || !env.AWS_S3_BUCKET) {
    throw new Error("S3 credentials are not configured");
  }
};

const createAwsSignature = (
  method: string,
  bucket: string,
  key: string,
  timestamp: string,
  headers: Record<string, string>
): string => {
  const date = timestamp.slice(0, 8);
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v}`)
    .join("\n");
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(k => k.toLowerCase())
    .join(";");
  
  const canonicalRequest = [
    method,
    `/${key}`,
    "",
    canonicalHeaders,
    "",
    signedHeaders,
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    `${date}/${env.AWS_REGION}/s3/aws4_request`,
    createHash("sha256").update(canonicalRequest).digest("hex")
  ].join("\n");
  
  const kDate = createHmac("sha256", `AWS4${env.AWS_SECRET_ACCESS_KEY}`).update(date).digest();
  const kRegion = createHmac("sha256", kDate).update(env.AWS_REGION).digest();
  const kService = createHmac("sha256", kRegion).update("s3").digest();
  const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  
  return signature;
};

const createS3Headers = (options: {
  method: string;
  bucket: string;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}) => {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = timestamp.slice(0, 8);
  
  const headers: Record<string, string> = {
    "Host": `${options.bucket}.s3.${env.AWS_REGION}.amazonaws.com`,
    "X-Amz-Date": timestamp,
  };
  
  if (options.contentType) {
    headers["Content-Type"] = options.contentType;
  }
  
  if (options.metadata) {
    Object.entries(options.metadata).forEach(([key, value]) => {
      headers[`X-Amz-Meta-${key}`] = value;
    });
  }
  
  const signature = createAwsSignature(options.method, options.bucket, options.key, timestamp, headers);
  const credential = `${env.AWS_ACCESS_KEY_ID}/${date}/${env.AWS_REGION}/s3/aws4_request`;
  const signedHeaders = Object.keys(headers).sort().map(k => k.toLowerCase()).join(";");
  
  headers["Authorization"] = `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return headers;
};

const createPresignedUrl = (
  method: string,
  bucket: string,
  key: string,
  expiresIn: number,
  contentType?: string
): string => {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = timestamp.slice(0, 8);
  const credential = `${env.AWS_ACCESS_KEY_ID}/${date}/${env.AWS_REGION}/s3/aws4_request`;
  
  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": timestamp,
    "X-Amz-Expires": expiresIn.toString(),
    "X-Amz-SignedHeaders": "host",
  });
  
  if (contentType) {
    params.set("Content-Type", contentType);
  }
  
  const headers = { "Host": `${bucket}.s3.${env.AWS_REGION}.amazonaws.com` };
  const signature = createAwsSignature(method, bucket, key, timestamp, headers);
  params.set("X-Amz-Signature", signature);
  
  return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}?${params.toString()}`;
};

export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface PresignedUrlOptions {
  key: string;
  expiresIn?: number;
  contentType?: string;
}

const buildKey = (key: string) => key.replace(/^\/+/, "");

export const storage = {
  isConfigured,

  async upload({ key, body, contentType, metadata }: UploadOptions) {
    assertStorage();
    const cleanKey = buildKey(key);
    
    const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`;
    const headers = createS3Headers({ 
      method: "PUT", 
      bucket: env.AWS_S3_BUCKET!, 
      key: cleanKey, 
      contentType, 
      metadata 
    });
    
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body,
    });
    
    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
    }

    return {
      key: cleanKey,
      url,
    };
  },

  async delete(key: string) {
    assertStorage();
    const cleanKey = buildKey(key);
    
    const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`;
    const headers = createS3Headers({ 
      method: "DELETE", 
      bucket: env.AWS_S3_BUCKET!, 
      key: cleanKey 
    });
    
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`S3 delete failed: ${response.status} ${response.statusText}`);
    }
    
    return { success: true };
  },

  async getPresignedUploadUrl({
    key,
    expiresIn = 3600,
    contentType,
  }: PresignedUrlOptions) {
    assertStorage();
    const cleanKey = buildKey(key);
    const url = createPresignedUrl("PUT", env.AWS_S3_BUCKET!, cleanKey, expiresIn, contentType);

    return { url, key: cleanKey };
  },

  async getPresignedDownloadUrl({ key, expiresIn = 3600 }: PresignedUrlOptions) {
    assertStorage();
    const cleanKey = buildKey(key);
    const url = createPresignedUrl("GET", env.AWS_S3_BUCKET!, cleanKey, expiresIn);

    return { url, key: cleanKey };
  },

  utils: {
    generateKey: (name: string, userId?: string) => {
      const safeName = name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const base = `${Date.now()}-${crypto.randomUUID()}`;
      return userId
        ? `uploads/${userId}/${base}-${safeName}`
        : `uploads/${base}-${safeName}`;
    },
  },
};

export type StorageClient = typeof storage;
