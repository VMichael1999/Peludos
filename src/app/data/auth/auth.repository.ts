import type { Result } from '../../core/result.ts';

export interface AuthUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
}

export interface AuthSession {
  readonly token: string;
  readonly user: AuthUser;
}

/**
 * The port the app talks to for accounts. The backend (Supabase, Firebase, an API of our own) is an
 * adapter behind it, so it can be swapped, and replaced with a fake in tests, without touching a
 * screen. An abstract class is the injection token.
 */
export abstract class AuthRepository {
  abstract signIn(email: string, password: string): Promise<Result<AuthSession>>;
  abstract register(username: string, email: string, password: string): Promise<Result<AuthSession>>;
  abstract sendPasswordReset(email: string): Promise<Result<void>>;
  /** Exchanges a stored token for the user it belongs to, or fails if it has expired. */
  abstract restore(token: string): Promise<Result<AuthSession>>;
}
