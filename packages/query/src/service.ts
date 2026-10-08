import type { DataRecord, RecordRepository } from "@puravigal/app-os-data";
import type { OrganizationId, TenantId } from "@puravigal/app-os-kernel";
import type { Filter, QueryRequest, QueryResult } from "./types.js";

export class QueryService {
  constructor(private readonly repository: RecordRepository) {}

  async execute(context: { tenantId: TenantId; organizationId: OrganizationId }, request: QueryRequest): Promise<QueryResult> {
    const limit = Math.min(Math.max(request.limit ?? 50, 1), 500);
    const offset = Math.max(request.offset ?? 0, 0);
    let records = await this.repository.list(context.tenantId, context.organizationId, request.entity);
    if (!request.includeDeleted) records = records.filter(record => record.lifecycle !== "deleted");

    if (request.filters?.length) records = records.filter(record => request.filters!.every(filter => this.matches(record, filter)));

    if (request.sort?.length) {
      records = [...records].sort((a, b) => {
        for (const sort of request.sort!) {
          const av = this.value(a, sort.field);
          const bv = this.value(b, sort.field);
          const comparison = av === bv ? 0 : av === undefined ? -1 : bv === undefined ? 1 : String(av).localeCompare(String(bv), undefined, { numeric: true });
          if (comparison !== 0) return sort.direction === "asc" ? comparison : -comparison;
        }
        return 0;
      });
    }

    const total = records.length;
    return { records: records.slice(offset, offset + limit), total, limit, offset };
  }

  private matches(record: DataRecord, filter: Filter): boolean {
    if ("and" in filter) return filter.and.every(child => this.matches(record, child));
    if ("or" in filter) return filter.or.some(child => this.matches(record, child));
    const actual = this.value(record, filter.field);
    switch (filter.operator) {
      case "eq": return actual === filter.value;
      case "neq": return actual !== filter.value;
      case "contains": return String(actual ?? "").toLowerCase().includes(String(filter.value ?? "").toLowerCase());
      case "starts_with": return String(actual ?? "").toLowerCase().startsWith(String(filter.value ?? "").toLowerCase());
      case "ends_with": return String(actual ?? "").toLowerCase().endsWith(String(filter.value ?? "").toLowerCase());
      case "gt": return typeof actual === "number" && typeof filter.value === "number" && actual > filter.value;
      case "gte": return typeof actual === "number" && typeof filter.value === "number" && actual >= filter.value;
      case "lt": return typeof actual === "number" && typeof filter.value === "number" && actual < filter.value;
      case "lte": return typeof actual === "number" && typeof filter.value === "number" && actual <= filter.value;
      case "in": return Array.isArray(filter.value) && filter.value.includes(actual);
      case "not_in": return Array.isArray(filter.value) && !filter.value.includes(actual);
      case "is_null": return actual === null || actual === undefined;
      case "is_not_null": return actual !== null && actual !== undefined;
    }
  }

  private value(record: DataRecord, field: string): unknown {
    if (field === "id") return record.id;
    if (field === "entity") return record.entity;
    if (field === "lifecycle") return record.lifecycle;
    if (field === "createdAt") return record.createdAt;
    if (field === "updatedAt") return record.updatedAt;
    return record.data[field];
  }
}
