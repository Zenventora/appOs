import { describe, expect, it } from "vitest";
import type { AppResult, DomainEvent, TenantId } from "./contracts.js";

describe("kernel contracts", () => {
  it("supports successful and failed results", () => {
    const success: AppResult<string> = { ok: true, value: "ok" };
    const failure: AppResult<string> = {
      ok: false,
      error: {
        code: "TEST_ERROR",
        message: "test",
        retryable: false
      }
    };

    expect(success.ok).toBe(true);
    expect(failure.ok).toBe(false);
  });

  it("keeps tenant context on domain events", () => {
    const event: DomainEvent = {
      id: "evt_1",
      type: "record.created",
      version: 1,
      occurredAt: new Date().toISOString(),
      tenantId: "tenant_1" as TenantId,
      organizationId: "org_1" as never,
      aggregate: { entity: "customer", id: "customer_1" as never },
      payload: {}
    };

    expect(event.tenantId).toBe("tenant_1");
  });
});
