import type { TenantId, OrganizationId, UserId } from "@puravigal/app-os-kernel";

export type SessionStatus = "active" | "revoked" | "expired";
export type ChallengeStatus = "pending" | "verified" | "consumed" | "expired" | "cancelled";
export type ChallengeType = "email_otp" | "sms_otp" | "magic_link" | "mfa_totp" | "mfa_passkey" | "recovery";

export interface AuthSession {
  id: string;
  userId: UserId;
  tenantId?: TenantId;
  organizationId?: OrganizationId;
  status: SessionStatus;
  issuedAt: string;
  expiresAt: string;
  lastSeenAt: string;
  revokedAt?: string;
  revokeReason?: string;
  deviceId?: string;
}

export interface AuthChallenge {
  id: string;
  userId: UserId;
  type: ChallengeType;
  status: ChallengeStatus;
  createdAt: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  verifiedAt?: string;
  consumedAt?: string;
}

export interface PasswordCredential {
  userId: UserId;
  passwordHash: string;
  algorithm: "argon2id" | "scrypt" | "bcrypt" | "external";
  createdAt: string;
  updatedAt: string;
  mustChange: boolean;
}

export interface MfaFactor {
  id: string;
  userId: UserId;
  type: "totp" | "passkey" | "email" | "sms" | "backup_code";
  label: string;
  enabled: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface LoginAttempt {
  id: string;
  userId?: UserId;
  identifier: string;
  provider: string;
  outcome: "success" | "failure" | "blocked" | "challenge_required";
  reason?: string;
  occurredAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccountRecovery {
  id: string;
  userId: UserId;
  status: "requested" | "verified" | "completed" | "expired" | "cancelled";
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
}

export interface PasswordVerifier {
  verify(password: string, passwordHash: string, algorithm: PasswordCredential["algorithm"]): Promise<boolean>;
}

export interface PasswordHasher {
  hash(password: string): Promise<Pick<PasswordCredential, "passwordHash" | "algorithm">>;
}

export interface AuthenticationRepository {
  saveSession(session: AuthSession): Promise<void>;
  getSession(id: string): Promise<AuthSession | undefined>;
  saveChallenge(challenge: AuthChallenge): Promise<void>;
  getChallenge(id: string): Promise<AuthChallenge | undefined>;
  saveCredential(credential: PasswordCredential): Promise<void>;
  getCredential(userId: UserId): Promise<PasswordCredential | undefined>;
  saveMfaFactor(factor: MfaFactor): Promise<void>;
  listMfaFactors(userId: UserId): Promise<MfaFactor[]>;
  saveLoginAttempt(attempt: LoginAttempt): Promise<void>;
  saveRecovery(recovery: AccountRecovery): Promise<void>;
}
