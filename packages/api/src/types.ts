import type { AppResult, RequestContext } from "@puravigal/app-os-kernel";

export interface ApiRequest {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  context: RequestContext;
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | string[]>;
  idempotencyKey?: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export interface ApiRoute<TRequest = unknown, TResponse = unknown> {
  method: ApiRequest["method"];
  pattern: RegExp;
  handle(request: ApiRequest, params: Record<string, string>): Promise<ApiResponse<TResponse>>;
}

export interface WebhookSubscription {
  id: string;
  tenantId: RequestContext["tenantId"];
  eventTypes: string[];
  targetUrl: string;
  secret: string;
  active: boolean;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventId: string;
  attempt: number;
  status: "pending" | "delivered" | "failed";
  responseStatus?: number;
  lastError?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface IdempotencyStore {
  get(key: string, tenantId: RequestContext["tenantId"], operation: string): Promise<AppResult<unknown> | undefined>;
  put(key: string, tenantId: RequestContext["tenantId"], operation: string, result: AppResult<unknown>): Promise<void>;
}
