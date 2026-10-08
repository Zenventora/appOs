import { randomUUID } from "node:crypto";
import type { DomainEvent } from "@puravigal/app-os-kernel";
import type { WebhookDelivery, WebhookSubscription } from "./types.js";

export interface WebhookTransport {
  send(url: string, payload: string, headers: Record<string, string>): Promise<{ status: number }>;
}

export class WebhookService {
  constructor(private readonly transport: WebhookTransport) {}

  async deliver(subscription: WebhookSubscription, event: DomainEvent, attempt = 1): Promise<WebhookDelivery> {
    const body = JSON.stringify(event);
    try {
      const response = await this.transport.send(subscription.targetUrl, body, {
        "content-type": "application/json",
        "x-app-os-event-id": event.id,
        "x-app-os-event-type": event.type,
        "x-app-os-attempt": String(attempt)
      });
      return {
        id: randomUUID(),
        subscriptionId: subscription.id,
        eventId: event.id,
        attempt,
        status: response.status >= 200 && response.status < 300 ? "delivered" : "failed",
        responseStatus: response.status,
        createdAt: new Date().toISOString(),
        ...(response.status >= 200 && response.status < 300 ? { deliveredAt: new Date().toISOString() } : {})
      };
    } catch (error) {
      return {
        id: randomUUID(),
        subscriptionId: subscription.id,
        eventId: event.id,
        attempt,
        status: "failed",
        lastError: error instanceof Error ? error.message : "WEBHOOK_DELIVERY_FAILED",
        createdAt: new Date().toISOString()
      };
    }
  }
}
