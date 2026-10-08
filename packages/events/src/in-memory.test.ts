import { describe, expect, it } from "vitest";
import { InMemoryEventBus } from "./in-memory.js";

describe("InMemoryEventBus", () => {
  it("dispatches events to subscribed handlers", async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    bus.subscribe("contact.created", { async handle(event) { seen.push(String(event.payload)); } });
    await bus.publish({
      id: "event-1",
      type: "contact.created",
      version: 1,
      occurredAt: new Date().toISOString(),
      tenantId: "tenant-1" as never,
      organizationId: "org-1" as never,
      aggregate: { entity: "contact", id: "contact-1" as never },
      payload: "ok"
    });
    expect(seen).toEqual(["ok"]);
  });
});
