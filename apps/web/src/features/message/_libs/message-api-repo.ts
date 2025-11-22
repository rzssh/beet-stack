import { api } from "~/lib/api-client";
import type {
  Message,
  MessageCreateParams,
  MessageUpdateParams,
} from "../_domain/message-model";
import type { MessageRepository } from "../_domain/message-repository";

export class MessageApiRepo implements MessageRepository {
  getMessages = async (): Promise<Message[]> => {
    const { data } = await api.messages.index.get();
    return data?.messages ?? [];
  };

  getMessage = async ({ id }: { id: string }): Promise<Message> => {
    const { data, error } = await api.messages({ id }).get();

    if (error ?? !data?.message) {
      throw new Error("Message not found");
    }

    return data.message;
  };

  createMessage = async ({
    params,
  }: {
    params: MessageCreateParams;
  }): Promise<Message> => {
    const { data, error } = await api.messages.index.post({
      content: params.content,
      title: params.title,
    });

    if (error ?? !data?.message) {
      throw new Error("Failed to create message");
    }

    return data.message;
  };

  updateMessage = async ({
    params,
  }: {
    params: MessageUpdateParams;
  }): Promise<Message> => {
    const { id, ...updateData } = params;

    const { data, error } = await api.messages({ id }).patch({
      content: updateData.content,
      title: updateData.title,
    });

    if (error ?? !data?.message) {
      throw new Error("Failed to update message");
    }

    return data.message;
  };

  deleteMessage = async ({
    id,
  }: { id: string }): Promise<{ success: boolean }> => {
    const { error } = await api.messages({ id }).delete();

    if (error) {
      throw new Error("Failed to delete message");
    }

    return { success: true };
  };
}

export const messageApiRepo = new MessageApiRepo();
