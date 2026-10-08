export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "dead_letter" | "cancelled";

export interface Job<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  lastError?: string;
}

export interface JobHandler<T = unknown> {
  handle(payload: T): Promise<void>;
}

export interface JobQueue {
  enqueue<T>(job: Job<T>): Promise<void>;
  claim(now?: Date): Promise<Job | undefined>;
  complete(id: string, now?: Date): Promise<void>;
  fail(id: string, error: string, now?: Date): Promise<void>;
}
