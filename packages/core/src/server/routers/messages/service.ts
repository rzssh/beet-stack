import { messageRepository } from "./repository";

interface MessageInput {
  title: string;
  content: string;
}

export class MessagesService {
  getAll() {
    return messageRepository.findMany();
  }

  getForUser(userId: string) {
    return messageRepository.findManyByUser(userId);
  }

  async create(input: MessageInput & { userId: string }) {
    const message = await messageRepository.create(input);
    if (!message) return { error: "create_failed" as const };
    return { message };
  }

  async getById({ id }: { id: string }) {
    return messageRepository.findById(id);
  }

  async validateOwnership({ id, userId }: { id: string; userId: string }) {
    const message = await messageRepository.findById(id);
    if (!message) return { error: "not_found" as const };
    if (message.userId !== userId) return { error: "not_authorized" as const };
    return { message };
  }

  async update(input: MessageInput & { id: string }) {
    return messageRepository.update(input.id, {
      title: input.title,
      content: input.content,
    });
  }

  async delete({ id }: { id: string }) {
    return messageRepository.delete(id);
  }
}

export const messagesService = new MessagesService();
