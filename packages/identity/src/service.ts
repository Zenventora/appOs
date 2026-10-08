import { randomUUID } from "node:crypto";
import type { OrganizationId, TenantId, UserId } from "@puravigal/app-os-kernel";
import type { Identity, Membership, Organization, Permission, Role, User } from "./types.js";

export interface CreateUserInput {
  email?: string;
  phone?: string;
  displayName: string;
}

export interface CreateOrganizationInput {
  tenantId: TenantId;
  name: string;
  slug: string;
  ownerUserId: UserId;
}

export interface IdentityRepository {
  saveUser(user: User): Promise<void>;
  getUser(id: UserId): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  saveIdentity(identity: Identity): Promise<void>;
  findIdentity(provider: Identity["provider"], providerSubject: string): Promise<Identity | undefined>;
  saveOrganization(org: Organization): Promise<void>;
  saveMembership(membership: Membership): Promise<void>;
  getMembership(tenantId: TenantId, organizationId: OrganizationId, userId: UserId): Promise<Membership | undefined>;
  saveRole(role: Role): Promise<void>;
  getRole(id: string): Promise<Role | undefined>;
  getPermissions(ids: string[]): Promise<Permission[]>;
}

export class IdentityService {
  constructor(private readonly repository: IdentityRepository) {}

  async createUser(input: CreateUserInput, now = new Date().toISOString()): Promise<User> {
    const user: User = {
      id: randomUUID() as UserId,
      email: input.email?.trim().toLowerCase(),
      phone: input.phone,
      displayName: input.displayName.trim(),
      status: "pending",
      emailVerified: false,
      phoneVerified: false,
      createdAt: now,
      updatedAt: now
    };
    await this.repository.saveUser(user);
    return user;
  }

  async createOrganization(input: CreateOrganizationInput, now = new Date().toISOString()): Promise<Organization> {
    const org: Organization = {
      id: randomUUID() as OrganizationId,
      tenantId: input.tenantId,
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    await this.repository.saveOrganization(org);
    await this.repository.saveMembership({
      id: randomUUID(),
      tenantId: input.tenantId,
      organizationId: org.id,
      userId: input.ownerUserId,
      status: "active",
      roleIds: [],
      createdAt: now,
      updatedAt: now
    });
    return org;
  }
}
