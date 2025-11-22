import type { Auth } from "./index";

export type SessionData = Awaited<ReturnType<Auth["api"]["getSession"]>>;
export type Session = NonNullable<SessionData>["session"];
export type User = NonNullable<SessionData>["user"];

export type { Auth, AuthConfig } from "./index";