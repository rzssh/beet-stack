export { db } from "./client";

// Export all business schemas
export * from "./schema";

// Export auth schemas
export * from "./auth-schema";

// Re-export common types
export type { User } from "./auth-schema";
export type { Message, Note } from "./schema";