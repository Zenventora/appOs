import type { AppResult, RequestContext } from "@puravigal/app-os-kernel";
import type { IdempotencyStore } from "./types.js";

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly values = new Map<string, AppResult<unknown>>();
  private key(key: string, tenantId: RequestContext["tenantId"], operation: string) {
    return `${tenantId}:${operation}:${key}`;
  }
  async get(key: string, tenantId: RequestContext["tenantId"], operation: string) {
    return this.values.get(this.key(key, tenantId, operation));
  }
  async put(key: string, tenantId: RequestContext["tenantId"], operation: string, result: AppResult<unknown>) {
    this.values.set(this.key(key, tenantId, operation), result);
  }
}
