import type { DataRecord } from "@puravigal/app-os-data";

export type FilterOperator =
  | "eq" | "neq" | "contains" | "starts_with" | "ends_with"
  | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "is_null" | "is_not_null";

export type Filter =
  | { field: string; operator: FilterOperator; value?: unknown }
  | { and: Filter[] }
  | { or: Filter[] };

export interface QueryRequest {
  entity: string;
  filters?: Filter[];
  sort?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

export interface QueryResult {
  records: DataRecord[];
  total: number;
  limit: number;
  offset: number;
}
