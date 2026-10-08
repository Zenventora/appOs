import type { EntityId, OrganizationId, TenantId, UserId } from "@puravigal/app-os-kernel";

export type RecordLifecycle = "draft" | "active" | "archived" | "deleted";

export interface DataRecord {
  id: EntityId;
  entity: string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  ownerUserId?: UserId;
  lifecycle: RecordLifecycle;
  version: number;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  archivedAt?: string;
}

export interface CreateRecordInput {
  entity: string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  ownerUserId?: UserId;
  lifecycle?: RecordLifecycle;
  data: Record<string, unknown>;
}

export interface UpdateRecordInput {
  id: EntityId;
  expectedVersion: number;
  data: Record<string, unknown>;
}

export interface RecordRepository {
  create(record: DataRecord): Promise<void>;
  get(tenantId: TenantId, organizationId: OrganizationId, entity: string, id: EntityId): Promise<DataRecord | undefined>;
  update(record: DataRecord): Promise<void>;
  list(tenantId: TenantId, organizationId: OrganizationId, entity: string): Promise<DataRecord[]>;
}
