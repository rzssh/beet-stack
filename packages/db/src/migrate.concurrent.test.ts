import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { copyFile, mkdir, rm } from "node:fs/promises";
import postgres from "postgres";

const enabled = process.env.RUN_POSTGRES_INTEGRATION === "1";

if (enabled) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  const hostname = new URL(process.env.DATABASE_URL).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error("migrator tests only run against loopback hosts");
  }
}

const suite = enabled ? describe : describe.skip;

const sourceUrl = new URL("../../../deploy/migrate.ts", import.meta.url);
const copyUrl = new URL("../.cache/migrate-check.ts", import.meta.url);
const migrationsUrl = new URL("../migrations", import.meta.url);
const workdirUrl = new URL("..", import.meta.url);

const baseConnection = (url: string) => {
  const parsed = new URL(url);
  const auth = parsed.username
    ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`
    : "";
  return `${parsed.protocol}//${auth}${parsed.host}`;
};

suite("serialized startup migrations", () => {
  let admin: ReturnType<typeof postgres> | undefined;

  beforeAll(async () => {
    await mkdir(new URL(".", copyUrl), { recursive: true });
    await copyFile(sourceUrl, copyUrl);
  });

  afterAll(async () => {
    await rm(copyUrl, { force: true });
    if (admin) await admin.end();
  });

  test("two concurrent migrators both exit zero on a fresh database", async () => {
    const base = baseConnection(process.env.DATABASE_URL!);
    admin = postgres(`${base}/postgres`, { max: 1 });
    const dbName = `beet_mt_${crypto.randomUUID().replaceAll("-", "")}`.slice(
      0,
      63,
    );
    await admin.unsafe(`CREATE DATABASE ${dbName}`);
    const targetUrl = `${base}/${dbName}`;

    const run = async () => {
      const proc = Bun.spawn({
        cmd: [process.execPath, copyUrl.pathname],
        cwd: workdirUrl.pathname,
        env: {
          ...process.env,
          DATABASE_URL: targetUrl,
          BEET_MIGRATIONS: migrationsUrl.pathname,
        },
        stdout: "ignore",
        stderr: "pipe",
      });
      const code = await proc.exited;
      const stderr = await new Response(proc.stderr).text();
      return { code, stderr };
    };

    try {
      const results = await Promise.all([run(), run()]);
      const failed = results.filter((result) => result.code !== 0);
      expect(failed, failed.map((result) => result.stderr).join("\n")).toEqual(
        [],
      );
    } finally {
      await admin.unsafe(`DROP DATABASE IF EXISTS ${dbName}`);
    }
  });
});
