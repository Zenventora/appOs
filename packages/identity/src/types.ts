import type { OrganizationId, TenantId, UserId } from "@puravigal/app-os-kernel";

export type IdentityProvider =
  | "password" | "email_otp" | "sms_otp" | "magic_link"
  | "google" | "microsoft" | "apple" | "facebook" | "github" | "linkedin" | "x"
  | "oidc" | "saml" | "passkey";

export type AccountStatus = "pending" | "active" | "suspended" | "locked" | "deactivated";

export interface User {
  id: UserId;
  email?: string;
  phone?: string;
  displayName: string;
  status: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Identity {
  id: string;
  userId: UserId;
  provider: IdentityProvider;
  providerSubject: string;
  email?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface Organization {
  id: OrganizationId;
  tenantId: TenantId;
  name: string;
  slug: string;
  status: "active" | "suspended" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = "invited" | "active" | "suspended" | "removed";

export interface Membership {
  id: string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  userId: UserId;
  status: MembershipStatus;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  tenantId: TenantId;
  organizationId?: OrganizationId;
  name: string;
  description?: string;
  system: boolean;
  permissionIds: string[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: "tenant" | "organization" | "record" | "field";
}
