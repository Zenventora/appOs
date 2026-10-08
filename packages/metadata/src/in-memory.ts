import type { EntityDefinition, MetadataRepository } from "./types.js";

export class InMemoryMetadataRepository implements MetadataRepository {
  readonly entities = new Map<string, EntityDefinition>();

  async saveEntity(definition: EntityDefinition) { this.entities.set(definition.name, structuredClone(definition)); }
  async getEntity(name: string) { return this.entities.get(name); }
  async listEntities() { return [...this.entities.values()]; }
}
