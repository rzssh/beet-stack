import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

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
  // Upload file to S3
  upload: async ({ key, body, contentType, metadata }: UploadOptions) => {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    try {
      const result = await s3Client.send(command);
      return {
        success: true,
        key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  // Get presigned URL for upload (client-side uploads)
  getPresignedUploadUrl: async ({ key, expiresIn = 3600, contentType }: PresignedUrlOptions) => {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn });
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
