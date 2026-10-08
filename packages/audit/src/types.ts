import type { AuditContext, EntityReference, OrganizationId, TenantId, UserId } from "@puravigal/app-os-kernel";

export interface AuditEntry {
  id: string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  actorUserId?: UserId;
  action: string;
  resource: EntityReference;
  context: AuditContext;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditRepository {
  append(entry: AuditEntry): Promise<void>;
  list(tenantId: TenantId, organizationId: OrganizationId, resource?: EntityReference): Promise<AuditEntry[]>;
}
