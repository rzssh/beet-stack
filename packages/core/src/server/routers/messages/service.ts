import { AppError, AuthorizationError, NotFoundError } from "@acme/core/server";
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

    if (!message) {
      throw new AppError(
        "Failed to create message",
        500,
        "MESSAGE_CREATE_FAILED",
        { userId: input.userId, title: input.title },
      );
    }

    return message;
  }

  async getById({ id }: { id: string }) {
    const message = await messageRepository.findById(id);
    if (!message) {
      throw new NotFoundError("Message", { messageId: id });
    }
    return message;
  }

  async validateOwnership({ id, userId }: { id: string; userId: string }) {
    const message = await this.getById({ id });
    if (message.userId !== userId) {
      throw new AuthorizationError(
        "You don't have permission to access this message",
        {
          messageId: id,
          userId,
          messageOwnerId: message.userId,
        },
      );
    }
    return message;
  }

  async update(input: MessageInput & { id: string }) {
    const message = await messageRepository.update(input.id, {
      title: input.title,
      content: input.content,
    });

    if (!message) {
      throw new NotFoundError("Message", { messageId: input.id });
    }

    return message;
  }

  async delete({ id }: { id: string }) {
    const message = await messageRepository.delete(id);
    if (!message) {
      throw new NotFoundError("Message", { messageId: id });
    }
    return message;
  }
}

export const messagesService = new MessagesService();
