import { describe, expect, it } from "vitest";
import { AuditService } from "./service.js";
import { InMemoryAuditRepository } from "./in-memory.js";

describe("AuditService", () => {
  it("stores tenant and organization scoped history", async () => {
    const repo = new InMemoryAuditRepository();
    const service = new AuditService(repo);
    await service.record({
      tenantId: "tenant-1" as never,
      organizationId: "org-1" as never,
      action: "record.updated",
      resource: { entity: "contact", id: "c-1" as never },
      context: {
        requestId: "req-1" as never,
        source: "api"
      },
      occurredAt: new Date().toISOString()
    });
    expect((await service.list("tenant-1" as never, "org-1" as never)).length).toBe(1);
    expect((await service.list("tenant-2" as never, "org-1" as never)).length).toBe(0);
  });
});
