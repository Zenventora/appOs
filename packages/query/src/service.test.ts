import { describe, expect, it } from "vitest";
import { DataService } from "@puravigal/app-os-data";
import { InMemoryRecordRepository } from "@puravigal/app-os-data";
import { QueryService } from "./service.js";

const tenant = "tenant-1" as never;
const org = "org-1" as never;

describe("QueryService", () => {
  it("filters sorts and paginates universal records", async () => {
    const repo = new InMemoryRecordRepository();
    const data = new DataService(repo);
    await data.create({ entity: "contact", tenantId: tenant, organizationId: org, data: { name: "Alice", score: 20 } });
    await data.create({ entity: "contact", tenantId: tenant, organizationId: org, data: { name: "Bob", score: 40 } });
    await data.create({ entity: "contact", tenantId: tenant, organizationId: org, data: { name: "Carol", score: 30 } });
    const result = await new QueryService(repo).execute(
      { tenantId: tenant, organizationId: org },
      { entity: "contact", filters: [{ field: "score", operator: "gte", value: 30 }], sort: [{ field: "score", direction: "desc" }], limit: 2 }
    );
    expect(result.total).toBe(2);
    expect(result.records.map(x => x.data.name)).toEqual(["Bob", "Carol"]);
  });
});
