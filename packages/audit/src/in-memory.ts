import type { AuditEntry, AuditRepository } from "./types.js";
import type { EntityReference, OrganizationId, TenantId } from "@puravigal/app-os-kernel";

export class InMemoryAuditRepository implements AuditRepository {
  readonly entries: AuditEntry[] = [];
  async append(entry: AuditEntry) { this.entries.push(structuredClone(entry)); }
  async list(tenantId: TenantId, organizationId: OrganizationId, resource?: EntityReference) {
    return this.entries.filter(x =>
      x.tenantId === tenantId &&
      x.organizationId === organizationId &&
      (!resource || (x.resource.entity === resource.entity && x.resource.id === resource.id))
    );
  }
}
