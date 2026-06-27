// State controller for the operations-dashboard React lane.
//
// This hook owns ALL app state and is the only place the app-local API
// (`../../src/api`) is called. It exposes plain values + actions so the
// rendering components stay declarative. The API is promise-returning, so every
// transition below (loading, error, assign-pending, resolve-pending) is a real
// async transition, not a synchronous fake.
//
// BOUNDARY: imports the data/API ONLY through the app-local barrel
// (`../../src/api`). It never imports fixtures or `../../src/data/adapter`.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createOperationsApi,
  type Environment,
  type Incident,
  type IncidentDetail,
  type IncidentFilters,
  type ServiceHealth,
  type Severity,
} from "../../src/api";

/** Simulated latency (ms) so loading/pending states are observable. */
const LATENCY_MS = 350;

/** All severities, in display order, for the filter control. */
export const SEVERITIES: Severity[] = ["critical", "high", "low"];

/** Environment options for the filter Select. */
export const ENVIRONMENTS: Environment[] = ["prod", "staging", "dev"];

/** Local UI filter state (the controlled inputs). */
export interface FilterState {
  search: string;
  environment: Environment | "";
  severities: Severity[];
}

const EMPTY_FILTERS: FilterState = {
  search: "",
  environment: "",
  severities: [],
};

export type LoadPhase = "loading" | "loaded" | "error";

export interface ToastState {
  id: number;
  title: string;
  variant: "success" | "info" | "warning" | "error";
}

export interface DashboardState {
  /** Load phase for the queue + summary. */
  phase: LoadPhase;
  /** Error message when phase === "error". */
  errorMessage: string | null;
  /** Active (unresolved) incidents matching the current filters. */
  incidents: Incident[];
  /** Per-service health for the summary band (unfiltered fleet view). */
  services: ServiceHealth[];
  /** Currently selected incident id, or null. */
  selectedId: string | null;
  /** Full detail for the selected incident (null while none/loading). */
  detail: IncidentDetail | null;
  /** True while the detail pane is fetching. */
  detailLoading: boolean;
  /** Controlled filter inputs. */
  filters: FilterState;
  /** Whether any filter is active (drives the Clear affordance). */
  filtersActive: boolean;
  /** Simulated load-failure flag (drives the error+retry path). */
  failLoads: boolean;
  /** Assign workflow (Sheet) open state. */
  assignOpen: boolean;
  /** True while assignIncident is committing. */
  assignPending: boolean;
  /** Resolve confirm (Dialog) open state. */
  resolveOpen: boolean;
  /** True while resolveIncident is committing. */
  resolvePending: boolean;
  /** Active toasts (most recent last). */
  toasts: ToastState[];
}

export interface DashboardActions {
  setSearch: (v: string) => void;
  setEnvironment: (v: Environment | "") => void;
  toggleSeverity: (s: Severity) => void;
  clearFilters: () => void;
  selectIncident: (id: string) => void;
  retry: () => void;
  /** Toggle the simulated load-failure flag (a dev affordance for the demo). */
  setFailLoads: (v: boolean) => void;
  openAssign: () => void;
  closeAssign: () => void;
  submitAssign: (assignee: string) => void;
  openResolve: () => void;
  closeResolve: () => void;
  confirmResolve: () => void;
  dismissToast: (id: number) => void;
}

function toApiFilters(f: FilterState): IncidentFilters {
  const out: IncidentFilters = {};
  if (f.search.trim() !== "") out.search = f.search;
  if (f.environment !== "") out.environment = f.environment;
  if (f.severities.length > 0) out.severities = f.severities;
  return out;
}

export function useDashboard(): DashboardState & { actions: DashboardActions } {
  // One API instance per app session (seeds its own mutable incident copy).
  const apiRef = useRef(createOperationsApi({ latencyMs: LATENCY_MS }));
  const api = apiRef.current;

  const [phase, setPhase] = useState<LoadPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [failLoads, setFailLoadsState] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPending, setAssignPending] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolvePending, setResolvePending] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toastSeq = useRef(0);
  const pushToast = useCallback(
    (title: string, variant: ToastState["variant"]) => {
      toastSeq.current += 1;
      const id = toastSeq.current;
      setToasts((prev) => [...prev, { id, title, variant }]);
    },
    [],
  );
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load the queue + service health for the current filters. Re-runs whenever
  // filters change (live filtering) or a retry/flag-toggle occurs.
  const load = useCallback(
    async (activeFilters: FilterState) => {
      setPhase("loading");
      setErrorMessage(null);
      const [listResult, healthResult] = await Promise.all([
        api.listIncidents(toApiFilters(activeFilters)),
        api.listServiceHealth(),
      ]);
      if (!listResult.ok) {
        setErrorMessage(listResult.error.message);
        setPhase("error");
        return;
      }
      if (!healthResult.ok) {
        setErrorMessage(healthResult.error.message);
        setPhase("error");
        return;
      }
      setIncidents(listResult.value);
      setServices(healthResult.value);
      setPhase("loaded");
    },
    [api],
  );

  // Re-load on filter change (debounce-free: latency lives behind the API).
  useEffect(() => {
    void load(filters);
  }, [filters, load]);

  // Fetch detail whenever the selection changes.
  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void api.getIncident(selectedId).then((result) => {
      if (cancelled) return;
      setDetailLoading(false);
      if (result.ok) {
        setDetail(result.value);
      } else {
        // Selected incident vanished (e.g. resolved elsewhere) — clear it.
        setDetail(null);
        setSelectedId(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, api]);

  const filtersActive = useMemo(
    () =>
      filters.search.trim() !== "" ||
      filters.environment !== "" ||
      filters.severities.length > 0,
    [filters],
  );

  const actions: DashboardActions = {
    setSearch: (v) => setFilters((f) => ({ ...f, search: v })),
    setEnvironment: (v) => setFilters((f) => ({ ...f, environment: v })),
    toggleSeverity: (s) =>
      setFilters((f) => ({
        ...f,
        severities: f.severities.includes(s)
          ? f.severities.filter((x) => x !== s)
          : [...f.severities, s],
      })),
    clearFilters: () => setFilters(EMPTY_FILTERS),
    selectIncident: (id) => setSelectedId(id),
    retry: () => void load(filters),
    setFailLoads: (v) => {
      api.simulateLoadFailure(v);
      setFailLoadsState(v);
    },
    openAssign: () => setAssignOpen(true),
    closeAssign: () => setAssignOpen(false),
    submitAssign: (assignee) => {
      if (selectedId === null || assignee.trim() === "") return;
      setAssignPending(true);
      void api.assignIncident(selectedId, assignee.trim()).then((result) => {
        setAssignPending(false);
        setAssignOpen(false);
        if (result.ok) {
          // Reflect the new assignee in the queue row and detail pane.
          setIncidents((prev) =>
            prev.map((i) =>
              i.id === result.value.id
                ? { ...i, assignee: result.value.assignee }
                : i,
            ),
          );
          setDetail((prev) =>
            prev && prev.id === result.value.id
              ? { ...prev, assignee: result.value.assignee }
              : prev,
          );
          pushToast(`Assigned ${result.value.id} to ${assignee.trim()}`, "success");
        } else {
          pushToast(result.error.message, "error");
        }
      });
    },
    openResolve: () => setResolveOpen(true),
    closeResolve: () => setResolveOpen(false),
    confirmResolve: () => {
      if (selectedId === null) return;
      const id = selectedId;
      setResolvePending(true);
      void api.resolveIncident(id).then((result) => {
        setResolvePending(false);
        setResolveOpen(false);
        if (result.ok) {
          // Remove from queue and clear the selection (detail → empty state).
          setIncidents((prev) => prev.filter((i) => i.id !== id));
          setSelectedId(null);
          setDetail(null);
          pushToast(`Resolved & closed ${id}`, "success");
        } else {
          pushToast(result.error.message, "error");
        }
      });
    },
    dismissToast,
  };

  return {
    phase,
    errorMessage,
    incidents,
    services,
    selectedId,
    detail,
    detailLoading,
    filters,
    filtersActive,
    failLoads,
    assignOpen,
    assignPending,
    resolveOpen,
    resolvePending,
    toasts,
    actions,
  };
}
