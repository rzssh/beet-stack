import { messageRepository } from "./messages.repository";

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

    if (!message) {
      throw new Error("Failed to create message");
    }

    return message;
  }

  async getById({ id }: { id: string }) {
    const message = await messageRepository.findById(id);
    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  }

  async validateOwnership({ id, userId }: { id: string; userId: string }) {
    const message = await this.getById({ id });
    if (message.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return message;
  }

  async update(input: MessageInput & { id: string }) {
    const message = await messageRepository.update(input.id, {
      title: input.title,
      content: input.content,
    });

    if (!message) {
      throw new Error("Message not found");
    }

    return message;
  }

  async delete({ id }: { id: string }) {
    const message = await messageRepository.delete(id);
    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  }
}

export const messagesService = new MessagesService();
