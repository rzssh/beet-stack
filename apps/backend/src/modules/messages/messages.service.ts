import { messageRepository } from "./messages.repository";

export class MessagesService {
  list(userId: string) {
    return messageRepository.findManyByUser(userId);
  }

  async create(userId: string, input: { title: string; content: string }) {
    const message = await messageRepository.create({
      ...input,
      userId,
    });

    if (!message) {
      throw new Error("Failed to create message");
    }

    return message;
  }

  async get(id: string, userId: string) {
    return this.assertOwnership(id, userId);
  }

  async update(
    id: string,
    userId: string,
    input: { title: string; content: string },
  ) {
    await this.assertOwnership(id, userId);

    const message = await messageRepository.update(id, input);
    if (!message) {
      throw new Error("Failed to update message");
    }

    return message;
  }

  async remove(id: string, userId: string) {
    await this.assertOwnership(id, userId);
    const deleted = await messageRepository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete message");
    }
    return deleted;
  }

  private async assertOwnership(id: string, userId: string) {
    const message = await messageRepository.findById(id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return message;
  }
}

export const messagesService = new MessagesService();
