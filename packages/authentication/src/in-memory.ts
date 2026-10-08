import type { UserId } from "@puravigal/app-os-kernel";
import type {
  AccountRecovery,
  AuthChallenge,
  AuthSession,
  AuthenticationRepository,
  LoginAttempt,
  MfaFactor,
  PasswordCredential
} from "./types.js";

export class InMemoryAuthenticationRepository implements AuthenticationRepository {
  readonly sessions = new Map<string, AuthSession>();
  readonly challenges = new Map<string, AuthChallenge>();
  readonly credentials = new Map<UserId, PasswordCredential>();
  readonly mfaFactors = new Map<string, MfaFactor>();
  readonly loginAttempts: LoginAttempt[] = [];
  readonly recoveries = new Map<string, AccountRecovery>();

  async saveSession(value: AuthSession) { this.sessions.set(value.id, value); }
  async getSession(id: string) { return this.sessions.get(id); }
  async saveChallenge(value: AuthChallenge) { this.challenges.set(value.id, value); }
  async getChallenge(id: string) { return this.challenges.get(id); }
  async saveCredential(value: PasswordCredential) { this.credentials.set(value.userId, value); }
  async getCredential(userId: UserId) { return this.credentials.get(userId); }
  async saveMfaFactor(value: MfaFactor) { this.mfaFactors.set(value.id, value); }
  async listMfaFactors(userId: UserId) { return [...this.mfaFactors.values()].filter(x => x.userId === userId); }
  async saveLoginAttempt(value: LoginAttempt) { this.loginAttempts.push(value); }
  async saveRecovery(value: AccountRecovery) { this.recoveries.set(value.id, value); }
}

export class PlaintextTestPasswordHasher implements import("./types.js").PasswordHasher, import("./types.js").PasswordVerifier {
  async hash(password: string) {
    return { passwordHash: password, algorithm: "external" as const };
  }
  async verify(password: string, passwordHash: string) {
    return password === passwordHash;
  }
}
