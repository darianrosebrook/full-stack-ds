// Lane-local fixture adapter for the operations-dashboard example.
//
// This module is the ONLY layer that touches the raw fixture file shape. It
// reads the static JSON/JSONL fixtures as bundler modules (isomorphic — the
// seam runs unchanged under node via Vitest and in the browser via Vite),
// parses and lightly validates them into the typed domain records declared in
// `../types`, and exposes those records to the functional API (`../api`). The
// adapter loads fixtures once and memoizes the parsed snapshot.
//
// BOUNDARY: future framework UI code must NOT import this module or the raw
// fixtures directly. UI consumes data only through the functional API in
// `../api`, which builds on this adapter. Keeping fixture-shape knowledge here
// means the queue rows can stay compact JSONL while detail/timeline joins
// happen in one typed place.

import incidentsRaw from "../../fixtures/incidents.jsonl?raw";
import timelineEventsRaw from "../../fixtures/timeline-events.jsonl?raw";
import serviceHealthRaw from "../../fixtures/service-health.json?raw";
import incidentDescriptionsRaw from "../../fixtures/incident-descriptions.json?raw";

import type {
  Incident,
  IncidentDetail,
  ServiceHealth,
  TimelineEvent,
} from "../types/index.js";

/** Parse a JSONL string into an array of records, ignoring blank lines. */
function parseJsonl<T>(raw: string, file: string): T[] {
  const out: T[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch (cause) {
      // A malformed fixture is a programmer/authoring error, not a domain
      // failure — throw loudly at load time rather than surface it as an
      // ApiError to the UI.
      throw new Error(
        `operations-dashboard adapter: invalid JSONL at ${file}:${i + 1}`,
        { cause },
      );
    }
  }
  return out;
}

/** The fully-parsed, joined snapshot the API operates over. */
export interface FixtureSnapshot {
  /** Active queue rows (compact incident shape). */
  incidents: Incident[];
  /** Per-service health for the summary band. */
  services: ServiceHealth[];
  /** Timeline events, grouped by incident id for detail lookup. */
  timelineByIncident: Map<string, TimelineEvent[]>;
  /** Long-form descriptions keyed by incident id. */
  descriptionById: Map<string, string>;
}

let memoized: FixtureSnapshot | null = null;

/**
 * Parse all fixtures into a typed snapshot. Memoized: the static fixtures are
 * read and parsed once, then the same frozen-by-convention snapshot is reused.
 * Pass `force` in tests to re-read (e.g. after deliberately mutating nothing —
 * the API owns mutable state, not the adapter).
 */
export function loadFixtures(force = false): FixtureSnapshot {
  if (memoized && !force) return memoized;

  const incidents = parseJsonl<Incident>(incidentsRaw, "incidents.jsonl");
  const events = parseJsonl<TimelineEvent>(
    timelineEventsRaw,
    "timeline-events.jsonl",
  );
  const services = (
    JSON.parse(serviceHealthRaw) as { services: ServiceHealth[] }
  ).services;
  const descriptions = JSON.parse(incidentDescriptionsRaw) as Record<
    string,
    string
  >;

  const timelineByIncident = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const list = timelineByIncident.get(ev.incidentId);
    if (list) list.push(ev);
    else timelineByIncident.set(ev.incidentId, [ev]);
  }
  // Keep each incident's timeline in chronological order regardless of fixture
  // line order, so the detail surface is deterministic.
  for (const list of timelineByIncident.values()) {
    list.sort((a, b) => a.at.localeCompare(b.at));
  }

  const descriptionById = new Map<string, string>(Object.entries(descriptions));

  memoized = { incidents, services, timelineByIncident, descriptionById };
  return memoized;
}

/**
 * Build the full detail record for one incident by joining the compact row
 * with its description and timeline. Returns null when the id is unknown.
 */
export function buildIncidentDetail(
  snapshot: FixtureSnapshot,
  incident: Incident,
): IncidentDetail {
  return {
    ...incident,
    description:
      snapshot.descriptionById.get(incident.id) ??
      "No description recorded for this incident.",
    timeline: snapshot.timelineByIncident.get(incident.id) ?? [],
  };
}
