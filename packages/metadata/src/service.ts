import type { EntityDefinition, FieldDefinition } from "./types.js";

export class MetadataService {
  constructor(private readonly repository: import("./types.js").MetadataRepository) {}

  async registerEntity(definition: EntityDefinition) {
    this.validate(definition);
    const existing = await this.repository.getEntity(definition.name);
    if (existing && definition.version <= existing.version) throw new Error("METADATA_VERSION_MUST_INCREASE");
    await this.repository.saveEntity(structuredClone(definition));
    return definition;
  }

  async getEntity(name: string) {
    return this.repository.getEntity(name);
  }

  async listEntities() {
    return this.repository.listEntities();
  }

  validateRecord(definition: EntityDefinition, data: Record<string, unknown>) {
    const errors: Array<{ field: string; code: string; message: string }> = [];
    for (const field of definition.fields) {
      const value = data[field.key];
      if (field.required && (value === undefined || value === null || value === "")) {
        errors.push({ field: field.key, code: "REQUIRED", message: `${field.label} is required` });
      }
      if (typeof value === "string" && field.validation?.max !== undefined && value.length > field.validation.max) {
        errors.push({ field: field.key, code: "MAX_LENGTH", message: `${field.label} exceeds maximum length` });
      }
      if (typeof value === "string" && field.validation?.regex && !(new RegExp(field.validation.regex)).test(value)) {
        errors.push({ field: field.key, code: "INVALID_FORMAT", message: `${field.label} has an invalid format` });
      }
      if (field.type === "select" && value !== undefined && field.options && !field.options.includes(String(value))) {
        errors.push({ field: field.key, code: "INVALID_OPTION", message: `${field.label} has an invalid option` });
      }
    }
    return errors;
  }

  private validate(definition: EntityDefinition) {
    if (!/^[a-z][a-z0-9_]*$/.test(definition.name)) throw new Error("INVALID_ENTITY_NAME");
    const keys = new Set<string>();
    for (const field of definition.fields) {
      if (keys.has(field.key)) throw new Error("DUPLICATE_FIELD_KEY");
      keys.add(field.key);
      this.validateField(field);
    }
  }

  private validateField(field: FieldDefinition) {
    if (!/^[a-z][a-z0-9_]*$/.test(field.key)) throw new Error("INVALID_FIELD_KEY");
    if ((field.type === "select" || field.type === "multi_select") && (!field.options || field.options.length === 0)) {
      throw new Error("SELECT_OPTIONS_REQUIRED");
    }
  }
}
