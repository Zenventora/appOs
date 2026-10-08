export type FieldType =
  | "text" | "long_text" | "number" | "currency" | "boolean" | "date" | "datetime"
  | "email" | "phone" | "url" | "select" | "multi_select" | "lookup" | "user"
  | "organization" | "file" | "json";

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  encrypted?: boolean;
  searchable?: boolean;
  defaultValue?: unknown;
  options?: string[];
  validation?: { min?: number; max?: number; regex?: string };
}

export interface RelationshipDefinition {
  key: string;
  fromEntity: string;
  toEntity: string;
  type: "one_to_one" | "one_to_many" | "many_to_one" | "many_to_many";
  required?: boolean;
  cascadeDelete?: boolean;
}

export interface EntityDefinition {
  name: string;
  label: string;
  version: number;
  fields: FieldDefinition[];
  relationships: RelationshipDefinition[];
  auditEnabled: boolean;
  softDeleteEnabled: boolean;
}

export interface MetadataRepository {
  saveEntity(definition: EntityDefinition): Promise<void>;
  getEntity(name: string): Promise<EntityDefinition | undefined>;
  listEntities(): Promise<EntityDefinition[]>;
}
