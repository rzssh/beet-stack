import type { Message } from "@acme/db";
import { NotFoundError, ValidationError } from "../../errors";
import { messageRepository } from "./repository";

interface MessageInput {
  title: string;
  content: string;
}

export interface MessageStore {
  findManyByUser(userId: string): Promise<Message[]>;
  findByIdForUser(id: string, userId: string): Promise<Message | undefined>;
  create(
    input: MessageInput & { userId: string },
  ): Promise<Message | undefined>;
  updateForUser(
    id: string,
    userId: string,
    input: MessageInput,
  ): Promise<Message | undefined>;
  deleteForUser(id: string, userId: string): Promise<Message | undefined>;
}

const normalize = ({ title, content }: MessageInput) => {
  const normalized = { title: title.trim(), content: content.trim() };
  if (!normalized.title || !normalized.content) {
    throw new ValidationError("Title and content are required");
  }
  return normalized;
};

export class MessagesService {
  constructor(private readonly repository: MessageStore = messageRepository) {}

  list(userId: string) {
    return this.repository.findManyByUser(userId);
  }

  async create(input: MessageInput & { userId: string }) {
    const message = await this.repository.create({
      ...normalize(input),
      userId: input.userId,
    });
    if (!message) throw new Error("Message insert returned no row");
    return message;
  }

  async get(id: string, userId: string) {
    const message = await this.repository.findByIdForUser(id, userId);
    if (!message) throw new NotFoundError("Message", { messageId: id });
    return message;
  }

  async update(id: string, userId: string, input: MessageInput) {
    const message = await this.repository.updateForUser(
      id,
      userId,
      normalize(input),
    );
    if (!message) throw new NotFoundError("Message", { messageId: id });
    return message;
  }

  async delete(id: string, userId: string) {
    const message = await this.repository.deleteForUser(id, userId);
    if (!message) throw new NotFoundError("Message", { messageId: id });
    return message;
  }
}

export const messagesService = new MessagesService();
