import { describe, expect, it } from "vitest";
import { InMemoryJobQueue, runJob } from "./in-memory.js";

describe("InMemoryJobQueue", () => {
  it("retries and eventually dead-letters failing jobs", async () => {
    const queue = new InMemoryJobQueue();
    const job = { id: "job-1", type: "test", payload: {}, status: "queued" as const, attempts: 0, maxAttempts: 2, availableAt: new Date(0).toISOString(), createdAt: new Date(0).toISOString() };
    await runJob(queue, job, { async handle() { throw new Error("boom"); } });
    const stored = queue.jobs.get("job-1")!;
    expect(stored.status).toBe("queued");
    stored.availableAt = new Date(0).toISOString();
    await runJob(queue, stored, { async handle() { throw new Error("boom"); } });
    expect(queue.jobs.get("job-1")?.status).toBe("dead_letter");
  });
});
