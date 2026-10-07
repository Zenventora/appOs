/**
 * Framework-neutral contracts for the App OS kernel.
 * Domain engines depend on these contracts; the kernel does not depend on domains.
 */

export type TenantId = string & { readonly __brand: "TenantId" };
export type UserId = string & { readonly __brand: "UserId" };
export type OrganizationId = string & { readonly __brand: "OrganizationId" };
export type EntityId = string & { readonly __brand: "EntityId" };
export type RequestId = string & { readonly __brand: "RequestId" };

export interface RequestContext {
  requestId: RequestId;
  tenantId: TenantId;
  organizationId: OrganizationId;
  actorUserId?: UserId;
  locale: string;
  timezone: string;
}

export interface EntityReference {
  entity: string;
  id: EntityId;
}

export interface AuditContext {
  actorUserId?: UserId;
  requestId: RequestId;
  source: "ui" | "api" | "automation" | "integration" | "system";
  reason?: string;
}

export interface DomainEvent<TPayload = unknown> {
  id: string;
  type: string;
  version: number;
  occurredAt: string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  aggregate: EntityReference;
  payload: TPayload;
  correlationId?: string;
  causationId?: string;
}

export interface Result<T> {
  ok: true;
  value: T;
}

export interface Failure {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export interface ResultError {
  ok: false;
  error: Failure;
}

export type AppResult<T> = Result<T> | ResultError;

export interface IdempotencyRecord {
  key: string;
  requestId: RequestId;
  tenantId: TenantId;
  operation: string;
  status: "processing" | "succeeded" | "failed";
  response?: unknown;
  createdAt: string;
  expiresAt?: string;
}

export interface PermissionDecision {
  allowed: boolean;
  reason?: string;
}

export interface PermissionEvaluator {
  can(
    context: RequestContext,
    action: string,
    resource: EntityReference
  ): Promise<PermissionDecision>;
}
