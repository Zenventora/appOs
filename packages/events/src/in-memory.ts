import type { DomainEvent } from "@puravigal/app-os-kernel";
import type { EventBus, EventHandler } from "./types.js";

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe<T>(type: string, handler: EventHandler<T>) {
    const list = this.handlers.get(type) ?? [];
    list.push(handler as EventHandler);
    this.handlers.set(type, list);
  }

  async publish<T>(event: DomainEvent<T>) {
    for (const handler of this.handlers.get(event.type) ?? []) await handler.handle(event);
  }
}
