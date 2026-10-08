import type { EntityId, OrganizationId, TenantId } from "@puravigal/app-os-kernel";
import type { DataRecord, RecordRepository } from "./types.js";

export class InMemoryRecordRepository implements RecordRepository {
  readonly records = new Map<string, DataRecord>();

  private key(tenantId: TenantId, organizationId: OrganizationId, entity: string, id: EntityId) {
    return entity === "*" ? "" : `${tenantId}:${organizationId}:${entity}:${id}`;
  }

  async create(record: DataRecord) {
    const key = this.key(record.tenantId, record.organizationId, record.entity, record.id);
    if (this.records.has(key)) throw new Error("RECORD_ALREADY_EXISTS");
    this.records.set(key, record);
  }

  async get(tenantId: TenantId, organizationId: OrganizationId, entity: string, id: EntityId) {
    if (entity === "") {
      for (const record of this.records.values()) {
        if (record.tenantId === tenantId && record.organizationId === organizationId && record.id === id) return record;
      }
      return undefined;
    }
    return this.records.get(this.key(tenantId, organizationId, entity, id));
  }

  async update(record: DataRecord) {
    const key = this.key(record.tenantId, record.organizationId, record.entity, record.id);
    if (!this.records.has(key)) throw new Error("RECORD_NOT_FOUND");
    this.records.set(key, record);
  }

  async list(tenantId: TenantId, organizationId: OrganizationId, entity: string) {
    return [...this.records.values()].filter(record =>
      record.tenantId === tenantId &&
      record.organizationId === organizationId &&
      (entity === "*" || record.entity === entity)
    );
  }
}
