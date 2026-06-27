// Lane-local functional API for the operations-dashboard example.
//
// This is the surface future framework lanes (React/Vue/Svelte/Angular/Lit)
// import and call. It is promise-returning so the UI's loading / empty / error
// / pending / optimistic states are real async transitions. Simulated latency
// and failure live HERE, behind the API — never in UI code. The API owns its
// own mutable in-memory copy of the incident set (seeded from the adapter
// snapshot) so `assignIncident` / `resolveIncident` mutate API state without
// touching the memoized fixtures.
//
// BOUNDARY: UI code imports from this module only. It must not import the
// adapter (`../data`) or the raw fixtures directly.
//
// Determinism: there is no wall-clock randomness. Latency is a fixed,
// configurable number of milliseconds and can be set to 0 in tests; failure is
// driven by an explicit flag, not chance.

import {
  buildIncidentDetail,
  loadFixtures,
  type FixtureSnapshot,
} from "../data/adapter.js";
import type {
  ApiError,
  ApiResult,
  Incident,
  IncidentDetail,
  IncidentFilters,
  ServiceHealth,
} from "../types/index.js";

/** Construction-time options. All optional with deterministic defaults. */
export interface OperationsApiOptions {
  /**
   * Simulated latency applied to every call, in milliseconds. Default 0 so
   * tests run instantly; a lane can pass e.g. 400 to exercise loading states.
   */
  latencyMs?: number;
  /**
   * When true, read calls (`listIncidents`, `getIncident`, `listServiceHealth`)
   * resolve `{ ok: false, error: { code: "LOAD_FAILED" } }` to exercise the
   * error + retry path. Toggle at runtime via `simulateLoadFailure`.
   */
  failLoads?: boolean;
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ok<T>(value: T): ApiResult<T> {
  return { ok: true, value };
}

function err<T>(error: ApiError): ApiResult<T> {
  return { ok: false, error };
}

function matchesFilters(incident: Incident, filters: IncidentFilters): boolean {
  if (filters.environment && incident.environment !== filters.environment) {
    return false;
  }
  if (filters.severities && filters.severities.length > 0) {
    if (!filters.severities.includes(incident.severity)) return false;
  }
  if (filters.search && filters.search.trim() !== "") {
    const needle = filters.search.trim().toLowerCase();
    const haystack =
      `${incident.id} ${incident.title} ${incident.service}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

/**
 * The operations-dashboard functional API. Construct one per app session via
 * `createOperationsApi()`; it seeds mutable state from the fixture snapshot.
 */
export class OperationsApi {
  private readonly snapshot: FixtureSnapshot;
  /** Mutable working copy of incidents (API-owned, not the fixture array). */
  private incidents: Incident[];
  private latencyMs: number;
  private failLoads: boolean;

  constructor(snapshot: FixtureSnapshot, options: OperationsApiOptions = {}) {
    this.snapshot = snapshot;
    // Shallow-clone each record so mutations stay inside the API.
    this.incidents = snapshot.incidents.map((i) => ({ ...i }));
    this.latencyMs = options.latencyMs ?? 0;
    this.failLoads = options.failLoads ?? false;
  }

  /** Toggle the simulated read-failure flag at runtime (drives error→retry). */
  simulateLoadFailure(enabled: boolean): void {
    this.failLoads = enabled;
  }

  /** List active (unresolved) incidents matching the multi-axis filters. */
  async listIncidents(
    filters: IncidentFilters = {},
  ): Promise<ApiResult<Incident[]>> {
    await delay(this.latencyMs);
    if (this.failLoads) {
      return err({
        code: "LOAD_FAILED",
        message: "Simulated load failure while listing incidents.",
      });
    }
    const rows = this.incidents
      .filter((i) => !i.resolved && matchesFilters(i, filters))
      .map((i) => ({ ...i }));
    return ok(rows);
  }

  /** Fetch the full detail (description + timeline) for one incident id. */
  async getIncident(id: string): Promise<ApiResult<IncidentDetail>> {
    await delay(this.latencyMs);
    if (this.failLoads) {
      return err({
        code: "LOAD_FAILED",
        message: "Simulated load failure while fetching incident detail.",
      });
    }
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident || incident.resolved) {
      return err({
        code: "NOT_FOUND",
        message: `Incident ${id} not found in the active queue.`,
      });
    }
    return ok(buildIncidentDetail(this.snapshot, { ...incident }));
  }

  /** List per-service health for the header summary band. */
  async listServiceHealth(): Promise<ApiResult<ServiceHealth[]>> {
    await delay(this.latencyMs);
    if (this.failLoads) {
      return err({
        code: "LOAD_FAILED",
        message: "Simulated load failure while listing service health.",
      });
    }
    return ok(this.snapshot.services.map((s) => ({ ...s })));
  }

  /** Assign (or reassign) an incident; resolves the updated incident. */
  async assignIncident(
    id: string,
    assignee: string,
  ): Promise<ApiResult<Incident>> {
    await delay(this.latencyMs);
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident || incident.resolved) {
      return err({
        code: "NOT_FOUND",
        message: `Incident ${id} not found in the active queue.`,
      });
    }
    incident.assignee = assignee;
    return ok({ ...incident });
  }

  /** Resolve & close an incident, removing it from the active queue. */
  async resolveIncident(id: string): Promise<ApiResult<Incident>> {
    await delay(this.latencyMs);
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) {
      return err({
        code: "NOT_FOUND",
        message: `Incident ${id} not found.`,
      });
    }
    if (incident.resolved) {
      return err({
        code: "ALREADY_RESOLVED",
        message: `Incident ${id} is already resolved.`,
      });
    }
    incident.resolved = true;
    return ok({ ...incident });
  }
}

/**
 * Factory: load the fixture snapshot via the adapter and construct an API.
 * Future framework lanes call this once and hold the returned instance.
 */
export function createOperationsApi(
  options: OperationsApiOptions = {},
): OperationsApi {
  return new OperationsApi(loadFixtures(), options);
}
