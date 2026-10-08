import { randomUUID } from "node:crypto";
import type { EntityId, OrganizationId, TenantId, UserId } from "@puravigal/app-os-kernel";
import type { CreateRecordInput, DataRecord, RecordRepository, UpdateRecordInput } from "./types.js";

export class DataConflictError extends Error {
  constructor(message = "RECORD_VERSION_CONFLICT") {
    super(message);
    this.name = "DataConflictError";
  }
}

export class DataService {
  constructor(private readonly repository: RecordRepository) {}

  async create(input: CreateRecordInput, now = new Date().toISOString()): Promise<DataRecord> {
    if (!input.entity.trim()) throw new Error("ENTITY_REQUIRED");
    const record: DataRecord = {
      id: randomUUID() as EntityId,
      entity: input.entity.trim(),
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      ownerUserId: input.ownerUserId,
      lifecycle: input.lifecycle ?? "active",
      version: 1,
      data: { ...input.data },
      createdAt: now,
      updatedAt: now
    };
    await this.repository.create(record);
    return record;
  }

  async get(
    tenantId: TenantId,
    organizationId: OrganizationId,
    entity: string,
    id: EntityId
  ): Promise<DataRecord | undefined> {
    return this.repository.get(tenantId, organizationId, entity, id);
  }

  async update(input: UpdateRecordInput, context: {
    tenantId: TenantId;
    organizationId: OrganizationId;
  }, now = new Date().toISOString()): Promise<DataRecord> {
    const current = await this.repository.get(context.tenantId, context.organizationId, "", input.id)
      ?? await this.findById(context, input.id);
    if (!current) throw new Error("RECORD_NOT_FOUND");
    if (current.version !== input.expectedVersion) throw new DataConflictError();
    const updated: DataRecord = {
      ...current,
      version: current.version + 1,
      data: { ...current.data, ...input.data },
      updatedAt: now
    };
    await this.repository.update(updated);
    return updated;
  }

  async archive(tenantId: TenantId, organizationId: OrganizationId, entity: string, id: EntityId, now = new Date().toISOString()) {
    return this.changeLifecycle(tenantId, organizationId, entity, id, "archived", now);
  }

  async restore(tenantId: TenantId, organizationId: OrganizationId, entity: string, id: EntityId, now = new Date().toISOString()) {
    return this.changeLifecycle(tenantId, organizationId, entity, id, "active", now);
  }

  async softDelete(tenantId: TenantId, organizationId: OrganizationId, entity: string, id: EntityId, now = new Date().toISOString()) {
    return this.changeLifecycle(tenantId, organizationId, entity, id, "deleted", now);
  }

  async clone(
    tenantId: TenantId,
    organizationId: OrganizationId,
    entity: string,
    id: EntityId,
    ownerUserId?: UserId,
    now = new Date().toISOString()
  ) {
    const source = await this.repository.get(tenantId, organizationId, entity, id);
    if (!source) throw new Error("RECORD_NOT_FOUND");
    return this.create({
      entity,
      tenantId,
      organizationId,
      ownerUserId,
      lifecycle: "draft",
      data: { ...source.data }
    }, now);
  }

  private async changeLifecycle(
    tenantId: TenantId,
    organizationId: OrganizationId,
    entity: string,
    id: EntityId,
    lifecycle: DataRecord["lifecycle"],
    now: string
  ) {
    const current = await this.repository.get(tenantId, organizationId, entity, id);
    if (!current) throw new Error("RECORD_NOT_FOUND");
    const updated: DataRecord = {
      ...current,
      lifecycle,
      version: current.version + 1,
      updatedAt: now,
      ...(lifecycle === "deleted" ? { deletedAt: now } : {}),
      ...(lifecycle === "archived" ? { archivedAt: now } : {})
    };
    await this.repository.update(updated);
    return updated;
  }

  private async findById(context: { tenantId: TenantId; organizationId: OrganizationId }, id: EntityId) {
    const allEntities = await this.repository.list(context.tenantId, context.organizationId, "*");
    return allEntities.find(record => record.id === id);
  }
}
