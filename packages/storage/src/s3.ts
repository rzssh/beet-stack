// Using Bun's native S3 support - much faster and lighter!
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

// Bun native S3 endpoint
const S3_ENDPOINT = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;

// S3 Authentication using Bun's native crypto
async function generateS3Auth(method: string, key: string, headers: Record<string, string>): Promise<string> {
  const date = new Date().toISOString().replace(/[:\-]/g, "").substring(0, 15) + "Z";
  const dateShort = date.substring(0, 8);
  
  const credential = `${AWS_ACCESS_KEY_ID}/${dateShort}/${AWS_REGION}/s3/aws4_request`;
  
  const canonicalHeaders = Object.entries(headers)
    .map(([k, v]) => `${k.toLowerCase()}:${v}`)
    .sort()
    .join("\n");
    
  const signedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
    .join(";");
  
  const canonicalRequest = [
    method,
    `/${key}`,
    "", // query string
    canonicalHeaders,
    "",
    signedHeaders,
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    `${dateShort}/${AWS_REGION}/s3/aws4_request`,
    await Bun.CryptoHasher.hash("sha256", canonicalRequest, "hex")
  ].join("\n");
  
  const signingKey = await getSigningKey(dateShort);
  const signature = await Bun.CryptoHasher.hmac("sha256", signingKey, stringToSign, "hex");
  
  return `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function getSigningKey(dateShort: string): Promise<Uint8Array> {
  const kDate = await Bun.CryptoHasher.hmac("sha256", `AWS4${AWS_SECRET_ACCESS_KEY}`, dateShort, "buffer");
  const kRegion = await Bun.CryptoHasher.hmac("sha256", kDate, AWS_REGION, "buffer");
  const kService = await Bun.CryptoHasher.hmac("sha256", kRegion, "s3", "buffer");
  return await Bun.CryptoHasher.hmac("sha256", kService, "aws4_request", "buffer");
}

async function generatePresignedUrl(method: string, key: string, expiration: number, contentType?: string): Promise<string> {
  const date = new Date().toISOString().replace(/[:\-]/g, "").substring(0, 15) + "Z";
  const dateShort = date.substring(0, 8);
  
  const credential = `${AWS_ACCESS_KEY_ID}/${dateShort}/${AWS_REGION}/s3/aws4_request`;
  
  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": date,
    "X-Amz-Expires": expiration.toString(),
    "X-Amz-SignedHeaders": "host",
  });
  
  if (contentType) {
    queryParams.set("Content-Type", contentType);
  }
  
  const canonicalRequest = [
    method,
    `/${key}`,
    queryParams.toString(),
    "host:" + `${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`,
    "",
    "host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    `${dateShort}/${AWS_REGION}/s3/aws4_request`,
    await Bun.CryptoHasher.hash("sha256", canonicalRequest, "hex")
  ].join("\n");
  
  const signingKey = await getSigningKey(dateShort);
  const signature = await Bun.CryptoHasher.hmac("sha256", signingKey, stringToSign, "hex");
  
  queryParams.set("X-Amz-Signature", signature);
  
  return `${S3_ENDPOINT}/${key}?${queryParams.toString()}`;
}

export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface PresignedUrlOptions {
  key: string;
  expiresIn?: number; // in seconds, default 3600 (1 hour)
  contentType?: string;
}

export const storage = {
  // Upload file to S3 using Bun's native HTTP with S3 API
  upload: async ({ key, body, contentType, metadata }: UploadOptions) => {
    try {
      const url = `${S3_ENDPOINT}/${key}`;
      
      const headers: Record<string, string> = {
        "Content-Type": contentType || "application/octet-stream",
      };

      // Add metadata headers
      if (metadata) {
        Object.entries(metadata).forEach(([metaKey, metaValue]) => {
          headers[`x-amz-meta-${metaKey}`] = metaValue;
        });
      }

      // Use Bun's native fetch with S3 authentication
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          ...headers,
          Authorization: await generateS3Auth("PUT", key, headers),
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
      }

      const etag = response.headers.get("etag");
      
      return {
        success: true,
        key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
        etag: etag?.replace(/"/g, "") || undefined,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  // Get presigned URL for upload using native Bun crypto
  getPresignedUploadUrl: async ({ key, expiresIn = 3600, contentType }: PresignedUrlOptions) => {
    try {
      const expiration = Math.floor(Date.now() / 1000) + expiresIn;
      const url = await generatePresignedUrl("PUT", key, expiration, contentType);
      return { url, key };
    } catch (error) {
      console.error("S3 presigned URL error:", error);
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  // Get presigned URL for download
  getPresignedDownloadUrl: async ({ key, expiresIn = 3600 }: Omit<PresignedUrlOptions, "contentType">) => {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return { url, key };
    } catch (error) {
      console.error("S3 presigned download URL error:", error);
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  // Delete file from S3
  delete: async (key: string) => {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      await s3Client.send(command);
      return { success: true, key };
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  // Upload file from Bun file
  uploadFromFile: async (file: File, key: string, metadata?: Record<string, string>) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    return storage.upload({
      key,
      body: buffer,
      contentType: file.type,
      metadata,
    });
  },

  // Utility functions
  utils: {
    // Generate unique key for file uploads
    generateKey: (originalName: string, userId?: string) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      if (userId) {
        return `uploads/${userId}/${timestamp}-${random}-${sanitizedName}`;
      }
      return `uploads/${timestamp}-${random}-${sanitizedName}`;
    },

    // Extract file extension
    getFileExtension: (filename: string) => {
      return filename.split('.').pop()?.toLowerCase() || '';
    },

    // Validate file type
    validateFileType: (file: File, allowedTypes: string[]) => {
      return allowedTypes.includes(file.type);
    },

    // Common file type groups
    fileTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      videos: ['video/mp4', 'video/mpeg', 'video/quicktime'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    },
  },
};

export { s3Client };
