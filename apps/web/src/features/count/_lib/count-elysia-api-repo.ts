import { api } from "@acme/api";
import type { ElysiaCountResponse } from "../_domain/count-model";
import type { CountRepository } from "../_domain/count-repository";

// Extract count from Eden Treaty response
const extractElysiaCount = (
  response: { data: { count: number } | null; error: any }
): { count: number } => {
  if (response.data?.count !== undefined) {
    return { count: response.data.count };
  }
  return { count: 0 };
};

// Elysia Implementation
export class ElysiaCountApiRepo implements CountRepository {
  getCount = async ({
    signal,
  }: { signal?: AbortSignal } = {}): Promise<{
    count: number;
  }> => {
    try {
      const response = await api.count.get({
        fetch: {
          signal,
        },
      });
      return extractElysiaCount(response);
    } catch (error) {
      if (signal?.aborted) {
        throw new Error("Request was aborted");
      }
      console.error("Failed to load count:", error);
      return { count: 0 };
    }
  };

  incrementCount = async (): Promise<{ count: number }> => {
    try {
      const response = await api.count.increment.post();
      return extractElysiaCount(response);
    } catch (error) {
      console.error("Failed to increment count:", error);
      return { count: 0 };
    }
  };
}

export const elysiaCountRepository = new ElysiaCountApiRepo();
