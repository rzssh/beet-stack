import { api } from "@acme/api";

export const storageService = {
  async createPresignedUpload({
    filename,
    contentType,
  }: {
    filename: string;
    contentType?: string;
  }) {
    const { data, error } = await api.files.presign.post({
      filename,
      contentType,
    });

    if (error) {
      throw new Error(
        error.message ||
          "Storage API unavailable. Configure AWS credentials to enable uploads.",
      );
    }

    return data;
  },
};
