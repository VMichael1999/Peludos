import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Biometrics } from '@ng-native/expo/biometrics';
import { Storage } from '@ng-native/expo/async-storage';
import { SecureStorage } from '@ng-native/expo/secure-store';
import { AuthRepository, type AuthSession, type AuthUser } from '../data/auth/auth.repository.ts';
import { fail, ok, type Result } from './result.ts';

/**
 * Who is signed in, and the conveniences around it: "Recordarme" (keeps the session token and the
 * email) and quick sign-in with Face ID or a fingerprint. The token lives in the keychain, never in
 * plain storage; the preferences live in plain storage.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly auth = inject(AuthRepository);
  private readonly storage = inject(Storage);
  private readonly secure = inject(SecureStorage);
  private readonly biometrics = inject(Biometrics);

  private readonly current = signal<AuthUser | null>(null);
  readonly user = this.current.asReadonly();
  readonly signedIn = computed(() => this.current() !== null);

  readonly rememberMe = this.storage.signal<boolean>('remember-me', true);
  readonly rememberedEmail = this.storage.signal<string>('remembered-email', '');
  readonly biometricEnabled = this.storage.signal<boolean>('biometric-enabled', false);
  readonly biometricPrompted = this.storage.signal<boolean>('biometric-prompted', false);
  private readonly token = this.secure.signal<string>('session-token', '');
  /** The token of this sign-in, held in memory until we know whether to keep it. */
  private latestToken = '';

  /** What the device can do for quick sign-in: 'face', 'fingerprint' or nothing. */
  readonly biometricKind = signal<'face' | 'fingerprint' | null>(null);

  /** Settles once the preferences and the token have been read back from the device. */
  private readonly storesReady = new Promise<void>((resolve) => {
    const watcher = effect(() => {
      if (!this.storage.ready() || !this.secure.ready()) return;
      resolve();
      untracked(() => watcher.destroy());
    });
  });

  constructor() {
    void this.detectBiometrics();
  }

  /**
   * At launch: signs the person back in with the kept token, when "Recordarme" was on. Quick sign-in
   * with Face ID is a different path: it keeps a token too, but asks the device before using it.
   */
  async restore(): Promise<boolean> {
    await this.storesReady;
    const stored = this.token();
    if (!this.rememberMe() || !stored) return false;
    const restored = await this.auth.restore(stored);
    if (!restored.ok) return false;
    this.current.set(restored.value.user);
    return true;
  }

  private async detectBiometrics(): Promise<void> {
    if (!(await this.biometrics.available())) return;
    const kinds = await this.biometrics.kinds();
    this.biometricKind.set(kinds.includes('face') ? 'face' : 'fingerprint');
  }

  async signIn(email: string, password: string, remember: boolean): Promise<Result<void>> {
    return this.accept(await this.auth.signIn(email, password), remember, email);
  }

  async register(username: string, email: string, password: string): Promise<Result<void>> {
    return this.accept(await this.auth.register(username, email, password), true, email);
  }

  async signInWithBiometrics(): Promise<Result<void>> {
    const prompt = await this.biometrics.authenticate('Entra a Peludos');
    if (!prompt.success) return fail('No pudimos confirmar tu identidad.');
    const stored = this.token();
    if (!stored) return fail('Entra con tu contraseña una vez para activar el acceso rápido.');
    const restored = await this.auth.restore(stored);
    if (!restored.ok) return fail(restored.error);
    this.current.set(restored.value.user);
    return ok(undefined);
  }

  /** Asks the device to confirm, then keeps the token so the next launch can skip the password. */
  async enableBiometrics(): Promise<Result<void>> {
    const prompt = await this.biometrics.authenticate('Activa el acceso rápido a Peludos');
    if (!prompt.success) return fail('No se activó el acceso rápido.');
    this.biometricEnabled.set(true);
    this.token.set(this.latestToken);
    return ok(undefined);
  }

  signOut(): void {
    this.current.set(null);
    this.token.set('');
  }

  private accept(result: Result<AuthSession>, remember: boolean, email: string): Result<void> {
    if (!result.ok) return fail(result.error);
    this.current.set(result.value.user);
    this.latestToken = result.value.token;
    this.rememberMe.set(remember);
    this.rememberedEmail.set(remember ? email : '');
    // The token is only kept when the person asked to be remembered, or wants quick sign-in.
    this.token.set(remember || this.biometricEnabled() ? result.value.token : '');
    return ok(undefined);
  }
}
