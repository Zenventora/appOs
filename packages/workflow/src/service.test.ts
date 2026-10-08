import { describe, expect, it } from "vitest";
import { WorkflowService, InMemoryWorkflowRepository } from "./service.js";

describe("WorkflowService", () => {
  it("executes matching actions and records execution", async () => {
    const repo = new InMemoryWorkflowRepository();
    const actions: string[] = [];
    const service = new WorkflowService(repo, { async execute(action) { actions.push(action.type); } });
    await service.register({
      id: "wf-1",
      name: "Qualify",
      entity: "lead",
      version: 1,
      active: true,
      trigger: { eventType: "lead.updated" },
      conditions: [{ field: "score", operator: "gte", value: 80 }],
      actions: [{ type: "set_field", config: { field: "status", value: "qualified" } }]
    });
    await service.executeForEvent({
      id: "event-1",
      type: "lead.updated",
      version: 1,
      occurredAt: new Date().toISOString(),
      tenantId: "tenant-1" as never,
      organizationId: "org-1" as never,
      aggregate: { entity: "lead", id: "lead-1" as never },
      payload: { score: 90 }
    });
    expect(actions).toEqual(["set_field"]);
    expect([...repo.executions.values()][0]?.status).toBe("succeeded");
  });
});
