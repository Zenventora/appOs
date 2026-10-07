import { describe, expect, it } from "vitest";
import { RolePermissionEvaluator } from "./authorization.js";
import { InMemoryIdentityRepository } from "./in-memory.js";

describe("RolePermissionEvaluator", () => {
  it("denies users without an active membership", async () => {
    const evaluator = new RolePermissionEvaluator(new InMemoryIdentityRepository());
    const result = await evaluator.can({
      requestId: "req_1" as never, tenantId: "tenant_1" as never, organizationId: "org_1" as never,
      actorUserId: "user_1" as never, locale: "en-IN", timezone: "Asia/Kolkata"
    }, "read", { entity: "customer", id: "c1" as never });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("ACTIVE_MEMBERSHIP_REQUIRED");
  });
});
