import { describe, expect, it } from "vitest";
import { AuthenticationService } from "./service.js";
import { InMemoryAuthenticationRepository, PlaintextTestPasswordHasher } from "./in-memory.js";
import type { IdentityRepository } from "@puravigal/app-os-identity";

const identity = new Map<string, { id: string; email: string; status: "active" }>();
const identityRepo: IdentityRepository = {
  async saveUser(user) { identity.set(user.email!, user as never); },
  async getUser(id) { return [...identity.values()].find(x => x.id === id) as never; },
  async saveIdentity() {},
  async findIdentity() { return undefined; },
  async saveOrganization() {},
  async saveMembership() {},
  async getMembership() { return undefined; },
  async saveRole() {},
  async getRole() { return undefined; },
  async getPermissions() { return []; },
  async findUserByEmail(email: string) { return identity.get(email) as never; }
};

describe("AuthenticationService", () => {
  it("creates a session after a valid password login", async () => {
    const user = { id: "user-1" as never, email: "owner@example.com", status: "active" as const };
    await identityRepo.saveUser(user as never);
    const repo = new InMemoryAuthenticationRepository();
    const passwords = new PlaintextTestPasswordHasher();
    const service = new AuthenticationService(identityRepo, repo, passwords, passwords);
    await service.setPassword(user.id, "a-very-long-test-password");
    const result = await service.loginWithPassword({ identifier: user.email, password: "a-very-long-test-password" });
    expect(result.status).toBe("authenticated");
    if (result.status === "authenticated") {
      expect(await service.validateSession(result.session.id)).toBeDefined();
    }
  });

  it("rejects invalid credentials", async () => {
    const user = { id: "user-2" as never, email: "owner2@example.com", status: "active" as const };
    await identityRepo.saveUser(user as never);
    const repo = new InMemoryAuthenticationRepository();
    const passwords = new PlaintextTestPasswordHasher();
    const service = new AuthenticationService(identityRepo, repo, passwords, passwords);
    await service.setPassword(user.id, "a-very-long-test-password");
    const result = await service.loginWithPassword({ identifier: user.email, password: "wrong-password" });
    expect(result).toEqual({ status: "rejected", reason: "INVALID_CREDENTIALS" });
  });

  it("expires sessions and supports explicit revocation", async () => {
    const user = { id: "user-3" as never, email: "owner3@example.com", status: "active" as const };
    await identityRepo.saveUser(user as never);
    const repo = new InMemoryAuthenticationRepository();
    const passwords = new PlaintextTestPasswordHasher();
    const service = new AuthenticationService(identityRepo, repo, passwords, passwords, { ttlSeconds: 1 });
    await service.setPassword(user.id, "a-very-long-test-password");
    const result = await service.loginWithPassword({ identifier: user.email, password: "a-very-long-test-password" });
    expect(result.status).toBe("authenticated");
    if (result.status === "authenticated") {
      await service.revokeSession(result.session.id);
      expect(await service.validateSession(result.session.id)).toBeUndefined();
    }
  });
});
