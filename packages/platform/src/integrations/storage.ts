import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";

const isConfigured =
  Boolean(env.AWS_S3_BUCKET) &&
  Boolean(env.AWS_ACCESS_KEY_ID) &&
  Boolean(env.AWS_SECRET_ACCESS_KEY);

const s3Client = isConfigured
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const assertStorage = () => {
  if (!s3Client || !env.AWS_S3_BUCKET) {
    throw new Error("S3 credentials are not configured");
  }
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
    await s3Client!.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: cleanKey,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      }),
    );

    return {
      key: cleanKey,
      url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`,
    };
  },

  async delete(key: string) {
    assertStorage();
    await s3Client!.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: buildKey(key),
      }),
    );
    return { success: true };
  },

  async getPresignedUploadUrl({
    key,
    expiresIn = 3600,
    contentType,
  }: PresignedUrlOptions) {
    assertStorage();
    const cleanKey = buildKey(key);
    const url = await getSignedUrl(
      s3Client!,
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: cleanKey,
        ContentType: contentType,
      }),
      { expiresIn },
    );

    return { url, key: cleanKey };
  },

  async getPresignedDownloadUrl({ key, expiresIn = 3600 }: PresignedUrlOptions) {
    assertStorage();
    const cleanKey = buildKey(key);
    const url = await getSignedUrl(
      s3Client!,
      new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: cleanKey,
      }),
      { expiresIn },
    );

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
