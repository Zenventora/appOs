import { describe, expect, it } from "vitest";
import { IdentityService } from "./service.js";
import { InMemoryIdentityRepository } from "./in-memory.js";

describe("IdentityService", () => {
  it("creates a pending user", async () => {
    const service = new IdentityService(new InMemoryIdentityRepository());
    const user = await service.createUser({ email: "USER@Example.COM", displayName: " User " });
    expect(user.email).toBe("user@example.com");
    expect(user.displayName).toBe("User");
    expect(user.status).toBe("pending");
  });

  it("creates an organization and owner membership", async () => {
    const repo = new InMemoryIdentityRepository();
    const service = new IdentityService(repo);
    const user = await service.createUser({ displayName: "Owner" });
    const org = await service.createOrganization({
      tenantId: "tenant_1" as never,
      name: "Acme",
      slug: "ACME",
      ownerUserId: user.id
    });
    expect(org.slug).toBe("acme");
    expect(await repo.getMembership(org.tenantId, org.id, user.id)).toMatchObject({ status: "active" });
  });
});
