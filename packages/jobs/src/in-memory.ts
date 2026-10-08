import type { Job, JobHandler, JobQueue } from "./types.js";

export class InMemoryJobQueue implements JobQueue {
  readonly jobs = new Map<string, Job>();
  async enqueue<T>(job: Job<T>) { this.jobs.set(job.id, { ...job }); }

  async claim(now = new Date()) {
    const available = [...this.jobs.values()]
      .filter(job => job.status === "queued" && Date.parse(job.availableAt) <= now.getTime())
      .sort((a, b) => Date.parse(a.availableAt) - Date.parse(b.availableAt))[0];
    if (!available) return undefined;
    available.status = "running";
    available.attempts += 1;
    available.startedAt = now.toISOString();
    await this.enqueue(available);
    return available;
  }

  async complete(id: string, now = new Date()) {
    const job = this.jobs.get(id);
    if (!job) throw new Error("JOB_NOT_FOUND");
    job.status = "succeeded";
    job.finishedAt = now.toISOString();
    await this.enqueue(job);
  }

  async fail(id: string, error: string, now = new Date()) {
    const job = this.jobs.get(id);
    if (!job) throw new Error("JOB_NOT_FOUND");
    job.lastError = error;
    job.finishedAt = now.toISOString();
    job.status = job.attempts >= job.maxAttempts ? "dead_letter" : "queued";
    if (job.status === "queued") job.availableAt = new Date(now.getTime() + Math.min(60_000 * 2 ** Math.max(job.attempts - 1, 0), 3_600_000)).toISOString();
    await this.enqueue(job);
  }
}

export async function runJob<T>(queue: JobQueue, job: Job<T>, handler: JobHandler<T>) {
  await queue.enqueue(job);
  const claimed = await queue.claim();
  if (!claimed) throw new Error("JOB_NOT_CLAIMED");
  try {
    await handler.handle(claimed.payload as T);
    await queue.complete(claimed.id);
  } catch (error) {
    await queue.fail(claimed.id, error instanceof Error ? error.message : "JOB_FAILED");
  }
}
