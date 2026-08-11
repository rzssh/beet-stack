import { beforeEach, describe, expect, test } from "bun:test";
import type { Message } from "@acme/db";
import { Elysia } from "elysia";
import type { Auth } from "../../../auth";
import { createServerConfiguration } from "../../base";
import { ValidationError } from "../../errors";
import { createMessagesRoutes } from "./index";
import { type MessageStore, MessagesService } from "./service";

class MemoryMessageStore implements MessageStore {
  private readonly messages = new Map<string, Message>();

  async findManyByUser(userId: string) {
    return [...this.messages.values()].filter(
      (message) => message.userId === userId,
    );
  }

  async findByIdForUser(id: string, userId: string) {
    const message = this.messages.get(id);
    return message?.userId === userId ? message : undefined;
  }

  async create(input: { title: string; content: string; userId: string }) {
    const now = new Date();
    const message = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.messages.set(message.id, message);
    return message;
  }

  async updateForUser(
    id: string,
    userId: string,
    input: { title: string; content: string },
  ) {
    const current = await this.findByIdForUser(id, userId);
    if (!current) return undefined;
    const updated = { ...current, ...input, updatedAt: new Date() };
    this.messages.set(id, updated);
    return updated;
  }

  async deleteForUser(id: string, userId: string) {
    const current = await this.findByIdForUser(id, userId);
    if (!current) return undefined;
    this.messages.delete(id);
    return current;
  }
}

const fakeAuth = {
  handler: () => new Response("Not found", { status: 404 }),
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      const userId = headers.get("authorization")?.replace("Bearer ", "");
      if (!userId) return null;
      const now = new Date();
      return {
        user: {
          id: userId,
          name: userId,
          email: `${userId}@example.test`,
          emailVerified: true,
          image: null,
          createdAt: now,
          updatedAt: now,
        },
        session: {
          id: `session-${userId}`,
          userId,
          token: `token-${userId}`,
          expiresAt: new Date(now.getTime() + 60_000),
          createdAt: now,
          updatedAt: now,
          ipAddress: null,
          userAgent: null,
        },
      };
    },
  },
} as unknown as Auth;

type TestApp = {
  handle(request: Request): Response | Promise<Response>;
};

const request = (
  app: TestApp,
  path: string,
  options: { method?: string; userId?: string; body?: unknown } = {},
) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method: options.method,
      headers: {
        ...(options.userId
          ? { authorization: `Bearer ${options.userId}` }
          : {}),
        ...(options.body ? { "content-type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
  );

describe("authenticated message contract", () => {
  let app: TestApp;

  beforeEach(() => {
    app = new Elysia()
      .use(
        createServerConfiguration({
          serviceName: "contract-test",
          auth: fakeAuth,
        }),
      )
      .use(createMessagesRoutes(new MessagesService(new MemoryMessageStore())));
  });

  test("requires a session for message reads and writes", async () => {
    const unauthList = await request(app, "/messages");
    expect(unauthList.status).toBe(401);
    expect(await unauthList.json()).toEqual({
      error: {
        message: expect.any(String),
        code: "UNAUTHORIZED",
        statusCode: 401,
        requestId: expect.any(String),
        timestamp: expect.any(String),
        path: "/messages",
      },
    });
    expect(
      (
        await request(app, "/messages", {
          method: "POST",
          body: { title: "Private", content: "No session" },
        })
      ).status,
    ).toBe(401);
  });

  test("supports owner CRUD and denies every cross-user operation", async () => {
    const createdResponse = await request(app, "/messages", {
      method: "POST",
      userId: "owner",
      body: { title: " First ", content: " Private message " },
    });
    expect(createdResponse.status).toBe(200);
    const created = (await createdResponse.json()) as { message: Message };
    expect(created.message.title).toBe("First");

    const ownerList = (await (
      await request(app, "/messages", { userId: "owner" })
    ).json()) as { messages: Message[] };
    expect(ownerList.messages.map(({ id }) => id)).toEqual([
      created.message.id,
    ]);

    const otherList = (await (
      await request(app, "/messages", { userId: "other" })
    ).json()) as { messages: Message[] };
    expect(otherList.messages).toEqual([]);

    expect(
      (
        await request(app, `/messages/${created.message.id}`, {
          userId: "other",
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await request(app, `/messages/${created.message.id}`, {
          method: "PATCH",
          userId: "other",
          body: { title: "Stolen", content: "Denied" },
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await request(app, `/messages/${created.message.id}`, {
          method: "DELETE",
          userId: "other",
        })
      ).status,
    ).toBe(404);

    const updatedResponse = await request(
      app,
      `/messages/${created.message.id}`,
      {
        method: "PATCH",
        userId: "owner",
        body: { title: "Updated", content: "Owner changed this" },
      },
    );
    expect(updatedResponse.status).toBe(200);
    const updated = (await updatedResponse.json()) as { message: Message };
    expect(updated.message.title).toBe("Updated");

    expect(
      (
        await request(app, `/messages/${created.message.id}`, {
          method: "DELETE",
          userId: "owner",
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app, `/messages/${created.message.id}`, {
          userId: "owner",
        })
      ).status,
    ).toBe(404);
  });

  test("rejects blank fields at the service boundary", async () => {
    const service = new MessagesService(new MemoryMessageStore());
    await expect(
      service.create({ userId: "owner", title: " ", content: "message" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
