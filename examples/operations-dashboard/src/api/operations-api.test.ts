import { describe, expect, it } from "vitest";

import { loadFixtures } from "../data/adapter.js";
import { OperationsApi, createOperationsApi } from "./operations-api.js";
import type { ApiResult } from "../types/index.js";

/** Unwrap a successful result or fail the test with the typed error. */
function expectOk<T>(result: ApiResult<T>): T {
  if (!result.ok) {
    throw new Error(`expected ok result, got error ${result.error.code}: ${result.error.message}`);
  }
  return result.value;
}

/** Fresh API per test so mutation tests do not bleed into each other. */
function freshApi(): OperationsApi {
  // latencyMs defaults to 0 — deterministic, no wall-clock waits.
  return new OperationsApi(loadFixtures(), {});
}

describe("operations-dashboard fixture adapter", () => {
  it("parses every incident row and joins descriptions + timelines", () => {
    const snapshot = loadFixtures(true);

    // The JSONL fixture holds exactly ten incident rows.
    expect(snapshot.incidents).toHaveLength(10);

    // INC-1042's timeline is sorted chronologically and has four events
    // ending in the escalation, regardless of fixture line order.
    const tl = snapshot.timelineByIncident.get("INC-1042");
    expect(tl?.map((e) => e.kind)).toEqual([
      "opened",
      "ack",
      "comment",
      "escalated",
    ]);

    // Every incident id has a long-form description in the lookup fixture.
    for (const incident of snapshot.incidents) {
      expect(snapshot.descriptionById.get(incident.id)).toBeTruthy();
    }
  });
});

describe("listIncidents filtering", () => {
  it("returns all ten active incidents when unfiltered", async () => {
    const rows = expectOk(await freshApi().listIncidents());
    expect(rows).toHaveLength(10);
    expect(rows.every((r) => !r.resolved)).toBe(true);
  });

  it("filters by case-insensitive search over id, title, and service", async () => {
    const api = freshApi();

    // Title substring.
    const byTitle = expectOk(await api.listIncidents({ search: "latency" }));
    expect(byTitle.map((r) => r.id)).toEqual(["INC-1042"]);

    // Service substring, case-insensitive.
    const byService = expectOk(await api.listIncidents({ search: "PAYMENTS" }));
    expect(byService.map((r) => r.id)).toEqual(["INC-1043"]);

    // Id substring.
    const byId = expectOk(await api.listIncidents({ search: "inc-1050" }));
    expect(byId.map((r) => r.id)).toEqual(["INC-1050"]);
  });

  it("filters by environment", async () => {
    const dev = expectOk(await freshApi().listIncidents({ environment: "dev" }));
    expect(dev.map((r) => r.id).sort()).toEqual(["INC-1046", "INC-1049"]);
    expect(dev.every((r) => r.environment === "dev")).toBe(true);
  });

  it("filters by severity as a union within the axis", async () => {
    const crit = expectOk(
      await freshApi().listIncidents({ severities: ["critical"] }),
    );
    expect(crit.map((r) => r.id).sort()).toEqual([
      "INC-1042",
      "INC-1043",
      "INC-1050",
    ]);

    const critOrLow = expectOk(
      await freshApi().listIncidents({ severities: ["critical", "low"] }),
    );
    // Three critical + three low = six; high severities excluded.
    expect(critOrLow).toHaveLength(6);
    expect(critOrLow.every((r) => r.severity !== "high")).toBe(true);
  });

  it("intersects across axes (prod AND critical)", async () => {
    const rows = expectOk(
      await freshApi().listIncidents({
        environment: "prod",
        severities: ["critical"],
      }),
    );
    // Of the three critical incidents, only INC-1042 and INC-1043 are prod;
    // INC-1050 is staging.
    expect(rows.map((r) => r.id).sort()).toEqual(["INC-1042", "INC-1043"]);
  });

  it("yields an empty result for a no-match filter (empty-state path)", async () => {
    const rows = expectOk(
      await freshApi().listIncidents({ search: "no-such-incident-xyz" }),
    );
    expect(rows).toEqual([]);
  });
});

describe("getIncident detail + timeline", () => {
  it("returns the joined detail with description and ordered timeline", async () => {
    const detail = expectOk(await freshApi().getIncident("INC-1042"));
    expect(detail.id).toBe("INC-1042");
    expect(detail.title).toBe("Checkout API latency spike");
    expect(detail.description).toContain("p99 latency exceeded 2s");
    expect(detail.timeline).toHaveLength(4);
    expect(detail.timeline[0].kind).toBe("opened");
    expect(detail.timeline.at(-1)?.kind).toBe("escalated");
  });

  it("returns a typed NOT_FOUND error for an unknown id", async () => {
    const result = await freshApi().getIncident("INC-9999");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });
});

describe("listServiceHealth", () => {
  it("returns all ten service-health records spanning every status", async () => {
    const services = expectOk(await freshApi().listServiceHealth());
    expect(services).toHaveLength(10);
    const statuses = new Set(services.map((s) => s.status));
    expect(statuses).toEqual(new Set(["healthy", "degraded", "down"]));
  });
});

describe("assignIncident mutates API state", () => {
  it("assigns an unassigned incident and the change is observable on reload", async () => {
    const api = freshApi();

    // INC-1043 starts unassigned.
    const before = expectOk(await api.getIncident("INC-1043"));
    expect(before.assignee).toBeNull();

    const assigned = expectOk(await api.assignIncident("INC-1043", "tgreen"));
    expect(assigned.assignee).toBe("tgreen");

    // The mutation persists in API state for subsequent reads.
    const after = expectOk(await api.getIncident("INC-1043"));
    expect(after.assignee).toBe("tgreen");
  });

  it("does not bleed mutations across separate API instances", async () => {
    // Mutate one instance, then a fresh instance must still see the original.
    const a = freshApi();
    await a.assignIncident("INC-1043", "tgreen");

    const b = freshApi();
    const onB = expectOk(await b.getIncident("INC-1043"));
    expect(onB.assignee).toBeNull();
  });
});

describe("resolveIncident mutates API state", () => {
  it("removes the incident from the active queue and rejects double-resolve", async () => {
    const api = freshApi();

    const resolved = expectOk(await api.resolveIncident("INC-1051"));
    expect(resolved.resolved).toBe(true);

    // Gone from the active queue.
    const rows = expectOk(await api.listIncidents());
    expect(rows.map((r) => r.id)).not.toContain("INC-1051");
    expect(rows).toHaveLength(9);

    // Detail fetch now misses (resolved items leave the active queue).
    const detail = await api.getIncident("INC-1051");
    expect(detail.ok).toBe(false);
    if (!detail.ok) expect(detail.error.code).toBe("NOT_FOUND");

    // Resolving again is a typed ALREADY_RESOLVED error.
    const again = await api.resolveIncident("INC-1051");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.code).toBe("ALREADY_RESOLVED");
  });
});

describe("simulated load failure produces typed errors", () => {
  it("fails reads with LOAD_FAILED while the flag is on, then recovers", async () => {
    const api = freshApi();
    api.simulateLoadFailure(true);

    const failedList = await api.listIncidents();
    expect(failedList.ok).toBe(false);
    if (!failedList.ok) expect(failedList.error.code).toBe("LOAD_FAILED");

    const failedDetail = await api.getIncident("INC-1042");
    expect(failedDetail.ok).toBe(false);
    if (!failedDetail.ok) expect(failedDetail.error.code).toBe("LOAD_FAILED");

    const failedHealth = await api.listServiceHealth();
    expect(failedHealth.ok).toBe(false);

    // Retry path: turning the flag off restores a populated queue.
    api.simulateLoadFailure(false);
    const recovered = expectOk(await api.listIncidents());
    expect(recovered).toHaveLength(10);
  });

  it("honors the failLoads construction option", async () => {
    const api = createOperationsApi({ failLoads: true });
    const result = await api.listIncidents();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("LOAD_FAILED");
  });
});
