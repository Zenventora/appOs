import { randomUUID } from "node:crypto";
import type { AuditContext, EntityReference, OrganizationId, TenantId } from "@puravigal/app-os-kernel";
import type { AuditEntry, AuditRepository } from "./types.js";

export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  async record(input: Omit<AuditEntry, "id">) {
    const entry: AuditEntry = { ...input, id: randomUUID() };
    await this.repository.append(entry);
    return entry;
  }

  async list(tenantId: TenantId, organizationId: OrganizationId, resource?: EntityReference) {
    return this.repository.list(tenantId, organizationId, resource);
  }
}
