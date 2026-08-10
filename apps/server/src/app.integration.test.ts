import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const enabled = process.env.RUN_POSTGRES_INTEGRATION === "1";
const ownerEmail = `owner-${crypto.randomUUID()}@example.test`;
const otherEmail = `other-${crypto.randomUUID()}@example.test`;
const emails = [ownerEmail, otherEmail];

if (enabled) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const hostname = new URL(process.env.DATABASE_URL).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(
      "PostgreSQL integration tests only run against loopback hosts",
    );
  }
}

const suite = enabled ? describe : describe.skip;

suite("PostgreSQL auth and message integration", () => {
  let app: typeof import("./app").app;
  let db: typeof import("@acme/db/client").db;
  let migrated = false;

  beforeAll(async () => {
    ({ db } = await import("@acme/db/client"));
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    await migrate(db, {
      migrationsFolder: new URL(
        "../../../packages/db/migrations",
        import.meta.url,
      ).pathname,
    });
    migrated = true;
    ({ app } = await import("./app"));
  });

  afterAll(async () => {
    if (!migrated) return;
    const { inArray } = await import("drizzle-orm");
    const { user } = await import("@acme/db/auth-schema");
    await db.delete(user).where(inArray(user.email, emails));
  });

  test("creates an account, restores a session, and isolates full CRUD", async () => {
    const ownerSignup = await authRequest("/api/auth/sign-up/email", {
      name: "Owner",
      email: ownerEmail,
      password: "integration-password",
    });
    expect(ownerSignup.status).toBe(200);
    const signupCookie = cookies(ownerSignup);
    expect(signupCookie).toContain("better-auth");

    const signOut = await request("/api/auth/sign-out", {
      method: "POST",
      cookie: signupCookie,
      body: {},
    });
    expect(signOut.status).toBe(200);
    expect((await request("/me", { cookie: cookies(signOut) })).status).toBe(
      401,
    );

    const ownerSignin = await authRequest("/api/auth/sign-in/email", {
      email: ownerEmail,
      password: "integration-password",
    });
    expect(ownerSignin.status).toBe(200);
    const ownerCookie = cookies(ownerSignin);
    expect((await request("/me", { cookie: ownerCookie })).status).toBe(200);

    const otherSignup = await authRequest("/api/auth/sign-up/email", {
      name: "Other",
      email: otherEmail,
      password: "integration-password",
    });
    expect(otherSignup.status).toBe(200);
    const otherCookie = cookies(otherSignup);

    const createdResponse = await request("/messages", {
      method: "POST",
      cookie: ownerCookie,
      body: { title: "Integration", content: "Owned by the first account" },
    });
    expect(createdResponse.status).toBe(200);
    const created = (await createdResponse.json()) as {
      message: { id: string; title: string };
    };

    expect(
      (
        (await (
          await request("/messages", { cookie: ownerCookie })
        ).json()) as {
          messages: { id: string }[];
        }
      ).messages.map(({ id }) => id),
    ).toContain(created.message.id);
    expect(
      (
        (await (
          await request("/messages", { cookie: otherCookie })
        ).json()) as {
          messages: { id: string }[];
        }
      ).messages,
    ).toEqual([]);

    for (const options of [
      { method: "GET" },
      {
        method: "PATCH",
        body: { title: "Denied", content: "Other account cannot update" },
      },
      { method: "DELETE" },
    ]) {
      expect(
        (
          await request(`/messages/${created.message.id}`, {
            ...options,
            cookie: otherCookie,
          })
        ).status,
      ).toBe(404);
    }

    const updated = await request(`/messages/${created.message.id}`, {
      method: "PATCH",
      cookie: ownerCookie,
      body: { title: "Updated", content: "Updated by the owner" },
    });
    expect(updated.status).toBe(200);
    expect(
      ((await updated.json()) as { message: { title: string } }).message.title,
    ).toBe("Updated");

    expect(
      (
        await request(`/messages/${created.message.id}`, {
          method: "DELETE",
          cookie: ownerCookie,
        })
      ).status,
    ).toBe(200);
  });

  const authRequest = (path: string, body: Record<string, string>) =>
    request(path, { method: "POST", body });

  const request = (
    path: string,
    options: { method?: string; cookie?: string; body?: unknown } = {},
  ) =>
    app.handle(
      new Request(`http://localhost:3001${path}`, {
        method: options.method,
        headers: {
          ...(options.cookie ? { cookie: options.cookie } : {}),
          ...(options.body ? { "content-type": "application/json" } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      }),
    );
});

function cookies(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
}
