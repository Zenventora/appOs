import type { DomainEvent } from "@puravigal/app-os-kernel";

export interface EventHandler<T = unknown> {
  handle(event: DomainEvent<T>): Promise<void>;
}

export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(type: string, handler: EventHandler<T>): void;
}
