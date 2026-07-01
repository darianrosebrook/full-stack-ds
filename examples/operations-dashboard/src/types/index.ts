// Lane-local app-layer domain + API types for the operations-dashboard example.
//
// These are NOT package exports. They describe the shapes the lane-local
// adapter (`../data`) parses out of the static fixtures and the shapes the
// lane-local functional API (`../api`) returns to future framework lanes.
// Framework UI code consumes these types via the API surface only.

/** Service health classification used by summary tiles and queue rows. */
export type ServiceStatus = "healthy" | "degraded" | "down";

/** Incident severity. Ordered most-to-least urgent for derived sorting. */
export type Severity = "critical" | "high" | "low";

/** Deployment environment an incident or service belongs to. */
export type Environment = "prod" | "staging" | "dev";

/** A single service's current health, used for the header summary band. */
export interface ServiceHealth {
  /** Stable service identifier, e.g. "checkout-api". */
  id: string;
  /** Human-readable service name. */
  name: string;
  /** Current health classification. */
  status: ServiceStatus;
  /** Environment this health record describes. */
  environment: Environment;
}

/** A queue row: the compact incident shape shown in the dense table/list. */
export interface Incident {
  /** Stable incident identifier, e.g. "INC-1042". */
  id: string;
  /** Short incident title. */
  title: string;
  /** Owning service id (joins to `ServiceHealth.id`). */
  service: string;
  /** Incident severity. */
  severity: Severity;
  /** Environment the incident occurred in. */
  environment: Environment;
  /** ISO-8601 timestamp the incident opened. */
  openedAt: string;
  /** Assignee handle, or null when unassigned. */
  assignee: string | null;
  /** Whether the incident has been resolved (removed from the active queue). */
  resolved: boolean;
}

/** A single event in an incident's timeline (progressive-disclosure detail). */
export interface TimelineEvent {
  /** Owning incident id. */
  incidentId: string;
  /** ISO-8601 timestamp of the event. */
  at: string;
  /** Event kind, e.g. "opened" | "ack" | "comment" | "escalated". */
  kind: string;
  /** Free-text event message. */
  message: string;
}

/** The full detail surface for a selected incident: row + body + timeline. */
export interface IncidentDetail extends Incident {
  /** Long-form incident description. */
  description: string;
  /** Chronologically ordered timeline events. */
  timeline: TimelineEvent[];
}

/** Multi-axis filter applied to the queue. All axes are optional (unset = no filter). */
export interface IncidentFilters {
  /** Case-insensitive substring matched against id, title, and service. */
  search?: string;
  /** Restrict to a single environment. */
  environment?: Environment;
  /**
   * Restrict to one or more severities. Empty/undefined means "any".
   * Semantics: union within this axis, intersection across axes.
   */
  severities?: Severity[];
}

/** Typed error codes the API surfaces instead of throwing untyped errors. */
export type ApiErrorCode =
  | "LOAD_FAILED"
  | "NOT_FOUND"
  | "ALREADY_RESOLVED";

/** A typed API error. Callers narrow on `code` to drive UI error states. */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

/**
 * Discriminated result the API methods resolve to. Methods never reject for
 * domain failures; they resolve `{ ok: false, error }` so future UI lanes can
 * model error states without try/catch around every call. (Programmer errors —
 * e.g. a malformed fixture at construction time — may still throw.)
 */
export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiError };
