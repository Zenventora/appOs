import type { IdentityRepository } from "./service.js";
import type { Identity, Membership, Organization, Permission, Role, User } from "./types.js";
import type { OrganizationId, TenantId, UserId } from "@puravigal/app-os-kernel";

export class InMemoryIdentityRepository implements IdentityRepository {
  readonly users = new Map<UserId, User>();
  readonly identities = new Map<string, Identity>();
  readonly organizations = new Map<OrganizationId, Organization>();
  readonly memberships = new Map<string, Membership>();
  readonly roles = new Map<string, Role>();
  readonly permissions = new Map<string, Permission>();

  async saveUser(user: User) { this.users.set(user.id, user); }
  async getUser(id: UserId) { return this.users.get(id); }
  async findUserByEmail(email: string) { return [...this.users.values()].find(user => user.email === email); }
  async saveIdentity(identity: Identity) { this.identities.set(identity.id, identity); }
  async findIdentity(provider: Identity["provider"], providerSubject: string) {
    return [...this.identities.values()].find(x => x.provider === provider && x.providerSubject === providerSubject);
  }
  async saveOrganization(org: Organization) { this.organizations.set(org.id, org); }
  async saveMembership(membership: Membership) {
    this.memberships.set(`${membership.tenantId}:${membership.organizationId}:${membership.userId}`, membership);
  }
  async getMembership(tenantId: TenantId, organizationId: OrganizationId, userId: UserId) {
    return this.memberships.get(`${tenantId}:${organizationId}:${userId}`);
  }
  async saveRole(role: Role) { this.roles.set(role.id, role); }
  async getRole(id: string) { return this.roles.get(id); }
  async getPermissions(ids: string[]) { return ids.flatMap(id => { const p = this.permissions.get(id); return p ? [p] : []; }); }
}
