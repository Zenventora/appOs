import { describe, expect, it } from "vitest";
import { MetadataService } from "./service.js";
import { InMemoryMetadataRepository } from "./in-memory.js";

describe("MetadataService", () => {
  it("registers versioned entities and validates records", async () => {
    const service = new MetadataService(new InMemoryMetadataRepository());
    const entity = {
      name: "contact",
      label: "Contact",
      version: 1,
      auditEnabled: true,
      softDeleteEnabled: true,
      relationships: [],
      fields: [
        { key: "email", label: "Email", type: "email" as const, required: true },
        { key: "status", label: "Status", type: "select" as const, options: ["new", "qualified"] }
      ]
    };
    await service.registerEntity(entity);
    expect(service.validateRecord(entity, { status: "invalid" })).toHaveLength(2);
    await expect(service.registerEntity({ ...entity, version: 1 })).rejects.toThrow("METADATA_VERSION_MUST_INCREASE");
  });

  it("rejects invalid schema definitions", async () => {
    const service = new MetadataService(new InMemoryMetadataRepository());
    await expect(service.registerEntity({
      name: "Contact",
      label: "Contact",
      version: 1,
      auditEnabled: true,
      softDeleteEnabled: true,
      relationships: [],
      fields: []
    })).rejects.toThrow("INVALID_ENTITY_NAME");
  });
});
