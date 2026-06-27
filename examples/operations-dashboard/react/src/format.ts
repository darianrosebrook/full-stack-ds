// Pure display-formatting helpers for the dashboard lane. These map domain
// values to the props the public design-system components expect. They are
// app-layer presentation logic (not package code) and contain no styling.

import type {
  BadgeIntent,
  StatusIntent,
} from "@full-stack-ds/react";
import type { ServiceStatus, Severity } from "../../src/api";

/** Map incident severity to a Badge intent (color semantics owned by Badge). */
export function severityIntent(severity: Severity): BadgeIntent {
  switch (severity) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "low":
      return "info";
  }
}

/** Map service-health status to a Status intent (owned by Status). */
export function serviceStatusIntent(status: ServiceStatus): StatusIntent {
  switch (status) {
    case "healthy":
      return "success";
    case "degraded":
      return "warning";
    case "down":
      return "danger";
  }
}

/** Compact relative age from an ISO timestamp (e.g. "3h", "2d"). */
export function formatAge(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
