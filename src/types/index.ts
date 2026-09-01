/**
 * Shared application types.
 * Domain models are added once the database schema is defined.
 */
export type { Database, Json } from "./database";

export type NavItem = {
  label: string;
  href: string;
};

/** Result wrapper used by the service layer. */
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
