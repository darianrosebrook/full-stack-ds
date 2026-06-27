// Public entry point for the operations-dashboard lane-local data layer.
//
// Future framework lanes import the functional API and domain types from here.
// They must NOT import the adapter (`../data`) or the raw fixtures directly —
// this barrel is the boundary.

export {
  OperationsApi,
  createOperationsApi,
  type OperationsApiOptions,
} from "./operations-api.js";

export type {
  ApiError,
  ApiErrorCode,
  ApiResult,
  Environment,
  Incident,
  IncidentDetail,
  IncidentFilters,
  ServiceHealth,
  ServiceStatus,
  Severity,
  TimelineEvent,
} from "../types/index.js";
