import type { EntityId } from "@puravigal/app-os-kernel";

export interface WorkflowCondition {
  field: string;
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte" | "is_true" | "is_false";
  value?: unknown;
}

export interface WorkflowAction {
  type: "set_field" | "emit_event" | "assign" | "notify" | "create_record";
  config: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  entity: string;
  version: number;
  active: boolean;
  trigger: { eventType: string };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  recordId: EntityId;
  status: "running" | "succeeded" | "failed";
  startedAt: string;
  finishedAt?: string;
  error?: string;
}
