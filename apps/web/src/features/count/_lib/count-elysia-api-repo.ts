import { api } from "@acme/api";
import type { ElysiaCountResponse } from "../_domain/count-model";
import type { CountRepository } from "../_domain/count-repository";

// Extract Elysia count from response safely
const extractElysiaCount = (
  response: any,
): { count: number } => {
  // Eden Treaty response might be wrapped differently
  if (response && typeof response === "object") {
    if ("count" in response) {
      return { count: response.count };
    }
    if (response.data && typeof response.data === "object" && "count" in response.data) {
      return { count: response.data.count };
    }
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
        $fetch: {
          signal,
        },
      });
      console.log("API Response:", response);
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
      console.log("Increment API Response:", response);
      return extractElysiaCount(response);
    } catch (error) {
      console.error("Failed to increment count:", error);
      return { count: 0 };
    }
  };
}

export const elysiaCountRepository = new ElysiaCountApiRepo();
