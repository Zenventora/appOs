import { describe, expect, it } from "vitest";
import { ApiRouter } from "./router.js";
import { InMemoryIdempotencyStore } from "./idempotency.js";
import { WebhookService } from "./webhooks.js";

const context = {
  requestId: "request-1" as never,
  tenantId: "tenant-1" as never,
  organizationId: "org-1" as never,
  locale: "en-IN",
  timezone: "Asia/Kolkata"
};

describe("API platform", () => {
  it("routes requests and returns 404 for unknown routes", async () => {
    const router = new ApiRouter();
    router.register({ method: "GET", pattern: /^\/v1\/contacts\/(?<id>[^/]+)$/, async (_request, params) => ({
      status: 200, headers: {}, body: { id: params.id }
    })});
    expect((await router.dispatch({ method: "GET", path: "/v1/contacts/c-1", context, headers: {} })).status).toBe(200);
    expect((await router.dispatch({ method: "GET", path: "/v1/missing", context, headers: {} })).status).toBe(404);
  });

  it("isolates idempotency by tenant and operation", async () => {
    const store = new InMemoryIdempotencyStore();
    const result = { ok: true as const, value: { created: true } };
    await store.put("same-key", context.tenantId, "create-contact", result);
    expect(await store.get("same-key", context.tenantId, "create-contact")).toEqual(result);
    expect(await store.get("same-key", "tenant-2" as never, "create-contact")).toBeUndefined();
  });

  it("records successful webhook delivery", async () => {
    const service = new WebhookService({ async send() { return { status: 200 }; } });
    const delivery = await service.deliver({
      id: "sub-1", tenantId: context.tenantId, eventTypes: ["contact.created"], targetUrl: "https://example.com/webhook", secret: "test", active: true
    }, {
      id: "evt-1", type: "contact.created", version: 1, occurredAt: new Date().toISOString(),
      tenantId: context.tenantId, organizationId: context.organizationId,
      aggregate: { entity: "contact", id: "c-1" as never }, payload: { id: "c-1" }
    });
    expect(delivery.status).toBe("delivered");
  });
});
