import type { RequestContext, EntityReference, PermissionDecision, PermissionEvaluator } from "@puravigal/app-os-kernel";
import type { Role } from "./types.js";
import type { IdentityRepository } from "./service.js";

export class RolePermissionEvaluator implements PermissionEvaluator {
  constructor(private readonly repository: IdentityRepository) {}

  async can(context: RequestContext, action: string, resource: EntityReference): Promise<PermissionDecision> {
    if (!context.actorUserId) return { allowed: false, reason: "AUTHENTICATED_USER_REQUIRED" };
    const membership = await this.repository.getMembership(context.tenantId, context.organizationId, context.actorUserId);
    if (!membership || membership.status !== "active") return { allowed: false, reason: "ACTIVE_MEMBERSHIP_REQUIRED" };

    const roles: Role[] = [];
    for (const roleId of membership.roleIds) {
      const role = await this.repository.getRole(roleId);
      if (role) roles.push(role);
    }
    const permissions = await this.repository.getPermissions(roles.flatMap(role => role.permissionIds));
    const allowed = permissions.some(p =>
      p.action === action &&
      (p.resource === "*" || p.resource === resource.entity) &&
      ["tenant", "organization", "record"].includes(p.scope)
    );
    return allowed ? { allowed: true } : { allowed: false, reason: "PERMISSION_DENIED" };
  }
}
