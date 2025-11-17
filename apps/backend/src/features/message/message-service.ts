import { messageDb } from "./db";

class MessageService {
  getAll = async () => {
    return messageDb.findAll();
  };

  getById = async (id: string) => {
    return messageDb.findById(id);
  };

  create = async ({ title, content, userId }: { title: string; content: string; userId: string }) => {
    return messageDb.create({ title, content, userId });
  };

  update = async ({ id, title, content }: { id: string; title: string; content: string }) => {
    return messageDb.update({ id, title, content });
  };

  delete = async (id: string) => {
    return messageDb.delete(id);
  };

  validateOwnership = async ({ id, userId }: { id: string; userId: string }) => {
    const message = await this.getById(id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return message;
  };
}

export const messageService = new MessageService();
