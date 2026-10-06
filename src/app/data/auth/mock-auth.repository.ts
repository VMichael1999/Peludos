import { Injectable } from '@angular/core';
import { fail, ok, type Result } from '../../core/result.ts';
import { AuthRepository, type AuthSession } from './auth.repository.ts';

const LATENCY_MS = 450;
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));

const sessionFor = (email: string, username?: string): AuthSession => {
  const name = username ?? email.split('@')[0] ?? 'amigo';
  return { token: 'mock.' + email, user: { id: 'u-' + name, username: name, email } };
};

/** An in-memory stand-in for the real backend: any well-formed account gets in. */
@Injectable()
export class MockAuthRepository extends AuthRepository {
  async signIn(email: string, password: string): Promise<Result<AuthSession>> {
    await wait();
    if (password.length < 8) return fail('El correo o la contraseña no coinciden. Inténtalo otra vez.');
    return ok(sessionFor(email));
  }

  async register(username: string, email: string): Promise<Result<AuthSession>> {
    await wait();
    return ok(sessionFor(email, username));
  }

  async sendPasswordReset(): Promise<Result<void>> {
    await wait();
    return ok(undefined);
  }

  async restore(token: string): Promise<Result<AuthSession>> {
    await wait();
    if (!token.startsWith('mock.')) return fail('Tu sesión venció. Entra de nuevo.');
    return ok(sessionFor(token.slice(5)));
  }
}
