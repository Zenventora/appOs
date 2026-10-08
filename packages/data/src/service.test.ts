import { describe, expect, it } from "vitest";
import { DataConflictError, DataService } from "./service.js";
import { InMemoryRecordRepository } from "./in-memory.js";

const tenant = "tenant-1" as never;
const org = "org-1" as never;

describe("DataService", () => {
  it("creates, updates and versions records", async () => {
    const service = new DataService(new InMemoryRecordRepository());
    const created = await service.create({ entity: "contact", tenantId: tenant, organizationId: org, data: { name: "A" } });
    const updated = await service.update({ id: created.id, expectedVersion: 1, data: { phone: "123" } }, { tenantId: tenant, organizationId: org });
    expect(updated.version).toBe(2);
    expect(updated.data).toEqual({ name: "A", phone: "123" });
  });

  it("rejects stale concurrent updates", async () => {
    const service = new DataService(new InMemoryRecordRepository());
    const created = await service.create({ entity: "deal", tenantId: tenant, organizationId: org, data: { value: 100 } });
    await service.update({ id: created.id, expectedVersion: 1, data: { value: 200 } }, { tenantId: tenant, organizationId: org });
    await expect(service.update({ id: created.id, expectedVersion: 1, data: { value: 300 } }, { tenantId: tenant, organizationId: org }))
      .rejects.toBeInstanceOf(DataConflictError);
  });

  it("supports archive, restore, delete and clone", async () => {
    const service = new DataService(new InMemoryRecordRepository());
    const created = await service.create({ entity: "product", tenantId: tenant, organizationId: org, data: { sku: "SKU-1" } });
    expect((await service.archive(tenant, org, "product", created.id)).lifecycle).toBe("archived");
    expect((await service.restore(tenant, org, "product", created.id)).lifecycle).toBe("active");
    expect((await service.softDelete(tenant, org, "product", created.id)).lifecycle).toBe("deleted");
    const clone = await service.clone(tenant, org, "product", created.id);
    expect(clone.lifecycle).toBe("draft");
    expect(clone.data).toEqual(created.data);
  });
});
