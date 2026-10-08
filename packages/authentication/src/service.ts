import { randomUUID } from "node:crypto";
import type { UserId } from "@puravigal/app-os-kernel";
import type { IdentityRepository } from "@puravigal/app-os-identity";
import type {
  AccountRecovery,
  AuthChallenge,
  AuthSession,
  AuthenticationRepository,
  LoginAttempt,
  PasswordCredential,
  PasswordHasher,
  PasswordVerifier
} from "./types.js";

export interface PasswordLoginInput {
  identifier: string;
  password: string;
  tenantId?: string;
  organizationId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionPolicy {
  ttlSeconds: number;
}

export class AuthenticationService {
  constructor(
    private readonly identity: IdentityRepository,
    private readonly repository: AuthenticationRepository,
    private readonly passwordVerifier: PasswordVerifier,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionPolicy: SessionPolicy = { ttlSeconds: 60 * 60 * 24 * 30 }
  ) {}

  async setPassword(userId: UserId, password: string, now = new Date().toISOString()): Promise<PasswordCredential> {
    if (password.length < 12) {
      throw new Error("PASSWORD_POLICY_VIOLATION");
    }
    const hashed = await this.passwordHasher.hash(password);
    const credential: PasswordCredential = {
      userId,
      passwordHash: hashed.passwordHash,
      algorithm: hashed.algorithm,
      createdAt: now,
      updatedAt: now,
      mustChange: false
    };
    await this.repository.saveCredential(credential);
    return credential;
  }

  async loginWithPassword(input: PasswordLoginInput, now = new Date()): Promise<
    { status: "authenticated"; session: AuthSession } |
    { status: "challenge_required"; challenge: AuthChallenge } |
    { status: "rejected"; reason: string }
  > {
    const normalized = input.identifier.trim().toLowerCase();
    const user = await this.findUser(normalized);
    if (!user) return this.reject(input, "INVALID_CREDENTIALS", now);

    if (user.status !== "active") return this.reject(input, "ACCOUNT_NOT_ACTIVE", now, user.id);

    const credential = await this.repository.getCredential(user.id);
    if (!credential) return this.reject(input, "PASSWORD_NOT_CONFIGURED", now, user.id);

    const valid = await this.passwordVerifier.verify(input.password, credential.passwordHash, credential.algorithm);
    if (!valid) return this.reject(input, "INVALID_CREDENTIALS", now, user.id);

    const factors = (await this.repository.listMfaFactors(user.id)).filter(f => f.enabled);
    if (factors.length > 0) {
      const challenge = await this.createChallenge(user.id, "recovery", now);
      await this.repository.saveLoginAttempt({
        id: randomUUID(),
        userId: user.id,
        identifier: normalized,
        provider: "password",
        outcome: "challenge_required",
        reason: "MFA_REQUIRED",
        occurredAt: now.toISOString(),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      });
      return { status: "challenge_required", challenge };
    }

    const session = await this.createSession(user.id, input, now);
    await this.repository.saveLoginAttempt({
      id: randomUUID(),
      userId: user.id,
      identifier: normalized,
      provider: "password",
      outcome: "success",
      occurredAt: now.toISOString(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    });
    return { status: "authenticated", session };
  }

  async createChallenge(
    userId: UserId,
    type: AuthChallenge["type"],
    now = new Date()
  ): Promise<AuthChallenge> {
    const challenge: AuthChallenge = {
      id: randomUUID(),
      userId,
      type,
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
      attempts: 0,
      maxAttempts: 5
    };
    await this.repository.saveChallenge(challenge);
    return challenge;
  }

  async revokeSession(sessionId: string, reason = "USER_REQUEST", now = new Date()): Promise<AuthSession> {
    const session = await this.repository.getSession(sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");
    if (session.status === "revoked") return session;
    session.status = "revoked";
    session.revokedAt = now.toISOString();
    session.revokeReason = reason;
    await this.repository.saveSession(session);
    return session;
  }

  async validateSession(sessionId: string, now = new Date()): Promise<AuthSession | undefined> {
    const session = await this.repository.getSession(sessionId);
    if (!session || session.status !== "active") return undefined;
    if (Date.parse(session.expiresAt) <= now.getTime()) {
      session.status = "expired";
      await this.repository.saveSession(session);
      return undefined;
    }
    session.lastSeenAt = now.toISOString();
    await this.repository.saveSession(session);
    return session;
  }

  async requestRecovery(userId: UserId, now = new Date()): Promise<AccountRecovery> {
    const recovery: AccountRecovery = {
      id: randomUUID(),
      userId,
      status: "requested",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString()
    };
    await this.repository.saveRecovery(recovery);
    return recovery;
  }

  private async createSession(userId: UserId, input: PasswordLoginInput, now: Date): Promise<AuthSession> {
    const session: AuthSession = {
      id: randomUUID(),
      userId,
      tenantId: input.tenantId as AuthSession["tenantId"],
      organizationId: input.organizationId as AuthSession["organizationId"],
      status: "active",
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.sessionPolicy.ttlSeconds * 1000).toISOString(),
      lastSeenAt: now.toISOString(),
      deviceId: input.deviceId
    };
    await this.repository.saveSession(session);
    return session;
  }

  private async findUser(identifier: string) {
    const repo = this.identity as IdentityRepository & { findUserByEmail?: (email: string) => Promise<import("@puravigal/app-os-identity").User | undefined> };
    if (repo.findUserByEmail) return repo.findUserByEmail(identifier);
    return undefined;
  }

  private async reject(
    input: PasswordLoginInput,
    reason: string,
    now: Date,
    userId?: UserId
  ): Promise<{ status: "rejected"; reason: string }> {
    await this.repository.saveLoginAttempt({
      id: randomUUID(),
      userId,
      identifier: input.identifier.trim().toLowerCase(),
      provider: "password",
      outcome: "failure",
      reason,
      occurredAt: now.toISOString(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    });
    return { status: "rejected", reason };
  }
}
