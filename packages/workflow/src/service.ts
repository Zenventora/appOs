import { randomUUID } from "node:crypto";
import type { DomainEvent } from "@puravigal/app-os-kernel";
import type { EventBus, EventHandler } from "@puravigal/app-os-events";
import type { WorkflowAction, WorkflowCondition, WorkflowDefinition, WorkflowExecution } from "./types.js";

export interface WorkflowActionExecutor {
  execute(action: WorkflowAction, event: DomainEvent): Promise<void>;
}

export interface WorkflowRepository {
  save(definition: WorkflowDefinition): Promise<void>;
  listActiveByEvent(eventType: string): Promise<WorkflowDefinition[]>;
  saveExecution(execution: WorkflowExecution): Promise<void>;
}

export class WorkflowService {
  constructor(
    private readonly repository: WorkflowRepository,
    private readonly executor: WorkflowActionExecutor
  ) {}

  async register(definition: WorkflowDefinition) {
    if (definition.version < 1) throw new Error("INVALID_WORKFLOW_VERSION");
    if (definition.actions.length === 0) throw new Error("WORKFLOW_ACTIONS_REQUIRED");
    await this.repository.save(definition);
  }

  handler(): EventHandler {
    return { handle: async event => this.executeForEvent(event) };
  }

  async executeForEvent(event: DomainEvent) {
    const workflows = await this.repository.listActiveByEvent(event.type);
    for (const workflow of workflows) {
      const started = new Date().toISOString();
      const execution: WorkflowExecution = {
        id: randomUUID(),
        workflowId: workflow.id,
        workflowVersion: workflow.version,
        recordId: event.aggregate.id,
        status: "running",
        startedAt: started
      };
      await this.repository.saveExecution(execution);
      try {
        if (workflow.conditions.every(condition => this.matches(condition, event.payload))) {
          for (const action of workflow.actions) await this.executor.execute(action, event);
        }
        execution.status = "succeeded";
        execution.finishedAt = new Date().toISOString();
      } catch (error) {
        execution.status = "failed";
        execution.error = error instanceof Error ? error.message : "WORKFLOW_EXECUTION_FAILED";
        execution.finishedAt = new Date().toISOString();
      }
      await this.repository.saveExecution(execution);
    }
  }

  private matches(condition: WorkflowCondition, payload: unknown) {
    if (!payload || typeof payload !== "object") return false;
    const actual = (payload as Record<string, unknown>)[condition.field];
    switch (condition.operator) {
      case "eq": return actual === condition.value;
      case "neq": return actual !== condition.value;
      case "contains": return String(actual ?? "").includes(String(condition.value ?? ""));
      case "gt": return typeof actual === "number" && typeof condition.value === "number" && actual > condition.value;
      case "gte": return typeof actual === "number" && typeof condition.value === "number" && actual >= condition.value;
      case "lt": return typeof actual === "number" && typeof condition.value === "number" && actual < condition.value;
      case "lte": return typeof actual === "number" && typeof condition.value === "number" && actual <= condition.value;
      case "is_true": return actual === true;
      case "is_false": return actual === false;
    }
  }
}

export class InMemoryWorkflowRepository implements WorkflowRepository {
  readonly definitions = new Map<string, WorkflowDefinition>();
  readonly executions = new Map<string, WorkflowExecution>();
  async save(definition: WorkflowDefinition) { this.definitions.set(definition.id, definition); }
  async listActiveByEvent(eventType: string) {
    return [...this.definitions.values()].filter(x => x.active && x.trigger.eventType === eventType);
  }
  async saveExecution(execution: WorkflowExecution) { this.executions.set(execution.id, { ...execution }); }
}
