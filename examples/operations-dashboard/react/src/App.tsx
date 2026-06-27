import { useMemo, useState } from "react";
import {
  Alert,
  AlertNotice,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Details,
  DetailsContent,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Divider,
  Field,
  Input,
  Select,
  Sheet,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Stack,
  Stat,
  Status,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Toast,
  ToastItem,
} from "@full-stack-ds/react";
import type { Environment, Incident, Severity } from "../../src/api";
import {
  ENVIRONMENTS,
  SEVERITIES,
  useDashboard,
} from "./useDashboard";
import { formatAge, serviceStatusIntent, severityIntent } from "./format";

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  low: "Low",
};

const ENV_OPTIONS = [
  { value: "", label: "All environments" },
  ...ENVIRONMENTS.map((e) => ({ value: e, label: e })),
];

export function App() {
  const dash = useDashboard();
  const { actions } = dash;
  const [assignee, setAssignee] = useState("");

  // Header summary counts are derived from the CURRENT (filtered) queue, plus
  // the fleet service-health roll-up — never hard-coded.
  const summary = useMemo(() => {
    const healthy = dash.services.filter((s) => s.status === "healthy").length;
    const degraded = dash.services.filter((s) => s.status === "degraded").length;
    const down = dash.services.filter((s) => s.status === "down").length;
    return { healthy, degraded, down, open: dash.incidents.length };
  }, [dash.services, dash.incidents]);

  const selected: Incident | null =
    dash.detail ??
    dash.incidents.find((i) => i.id === dash.selectedId) ??
    null;

  return (
    <div className="ops-shell">
      <Header summary={summary} dash={dash} />

      <div className="ops-body">
        <aside className="ops-rail">
          <FilterRail dash={dash} />
        </aside>

        <main className="ops-queue">
          <QueuePane dash={dash} />
        </main>

        <section className="ops-detail">
          <DetailPane dash={dash} selected={selected} />
        </section>
      </div>

      {/* Assign workflow — side Sheet. */}
      <Sheet
        open={dash.assignOpen}
        onOpenChange={(open) => (open ? actions.openAssign() : actions.closeAssign())}
        side="right"
        modal
      >
        <SheetHeader>
          <SheetTitle>Assign incident</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <Stack variant="vertical">
            <Text as="p">
              Assign {selected ? selected.id : "this incident"} to an on-call
              engineer.
            </Text>
            <Field name="assignee" slots={{ label: "Assignee" }}>
              <Input
                value={assignee}
                onChange={setAssignee}
                placeholder="e.g. @ada"
              />
            </Field>
          </Stack>
        </SheetBody>
        <SheetFooter>
          <Button variant="secondary" onClick={actions.closeAssign}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={dash.assignPending}
            disabled={dash.assignPending || assignee.trim() === ""}
            onClick={() => {
              actions.submitAssign(assignee);
              setAssignee("");
            }}
          >
            Assign
          </Button>
        </SheetFooter>
      </Sheet>

      {/* Resolve & close — confirm Dialog. */}
      <Dialog
        open={dash.resolveOpen}
        onOpenChange={(open) =>
          open ? actions.openResolve() : actions.closeResolve()
        }
        modal
        dismissible
        size="sm"
      >
        <DialogHeader>
          <DialogTitle>Resolve &amp; close incident?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text as="p">
            {selected
              ? `This removes ${selected.id} — "${selected.title}" — from the active queue. This cannot be undone in the demo.`
              : "Select an incident first."}
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={actions.closeResolve}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={dash.resolvePending}
            disabled={dash.resolvePending || !selected}
            onClick={actions.confirmResolve}
          >
            Resolve &amp; close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Transient feedback — Toast region. */}
      <div className="ops-toasts" aria-live="polite">
        {dash.toasts.map((t) => (
          <Toast
            key={t.id}
            open
            variant={t.variant}
            title={t.title}
            duration={null}
            onOpenChange={(open) => {
              if (!open) actions.dismissToast(t.id);
            }}
          >
            <ToastItem>
              <Button
                variant="ghost"
                size="small"
                onClick={() => actions.dismissToast(t.id)}
              >
                Dismiss
              </Button>
            </ToastItem>
          </Toast>
        ))}
      </div>
    </div>
  );
}

// --- Header band -----------------------------------------------------------

function Header({
  summary,
  dash,
}: {
  summary: { healthy: number; degraded: number; down: number; open: number };
  dash: ReturnType<typeof useDashboard>;
}) {
  return (
    <header className="ops-header">
      <Stack variant="horizontal">
        <Text as="h1" variant="heading" size="lg" weight="bold">
          Operations dashboard
        </Text>
      </Stack>
      <div className="ops-summary">
        <Card density="inset">
          <CardContent>
            <Stat trend="neutral">
              <Status status="success">Healthy</Status>
              <Text as="span" size="lg" weight="bold">
                {summary.healthy}
              </Text>
            </Stat>
          </CardContent>
        </Card>
        <Card density="inset">
          <CardContent>
            <Stat trend={summary.degraded > 0 ? "down" : "neutral"}>
              <Status status="warning">Degraded</Status>
              <Text as="span" size="lg" weight="bold">
                {summary.degraded}
              </Text>
            </Stat>
          </CardContent>
        </Card>
        <Card density="inset">
          <CardContent>
            <Stat trend={summary.down > 0 ? "down" : "neutral"}>
              <Status status="danger">Down</Status>
              <Text as="span" size="lg" weight="bold">
                {summary.down}
              </Text>
            </Stat>
          </CardContent>
        </Card>
        <Card density="inset">
          <CardContent>
            <Stat trend="neutral">
              <Badge variant="counter" intent="info">
                Open incidents
              </Badge>
              <Text as="span" size="lg" weight="bold">
                {summary.open}
              </Text>
            </Stat>
          </CardContent>
        </Card>
      </div>
      {/* Dev affordance: toggle the API's simulated load-failure flag so the
          error + retry path is demonstrable from the UI. */}
      <label className="ops-failtoggle">
        <Checkbox
          checked={dash.failLoads}
          onChange={(checked) => dash.actions.setFailLoads(checked)}
        />
        <Text as="span" size="sm">
          Simulate load failure
        </Text>
      </label>
    </header>
  );
}

// --- Filter rail -----------------------------------------------------------

function FilterRail({ dash }: { dash: ReturnType<typeof useDashboard> }) {
  const { filters, actions } = dash;
  return (
    <Card>
      <CardHeader>Filters</CardHeader>
      <CardContent>
        <Stack variant="vertical">
          <Field name="search" slots={{ label: "Search" }}>
            <Input
              value={filters.search}
              onChange={actions.setSearch}
              placeholder="id, title, or service"
            />
          </Field>

          <Field name="environment" slots={{ label: "Environment" }}>
            <Select
              options={ENV_OPTIONS}
              value={filters.environment}
              onChange={(v) => {
                const next = Array.isArray(v) ? (v[0] ?? "") : v;
                actions.setEnvironment(next as Environment | "");
              }}
            />
          </Field>

          <fieldset className="ops-severity">
            <Text as="legend" size="sm" weight="medium">
              Severity
            </Text>
            <Stack variant="vertical">
              {SEVERITIES.map((s) => (
                <label key={s} className="ops-check-row">
                  <Checkbox
                    checked={filters.severities.includes(s)}
                    onChange={() => actions.toggleSeverity(s)}
                  />
                  <Text as="span" size="sm">
                    {SEVERITY_LABEL[s]}
                  </Text>
                </label>
              ))}
            </Stack>
          </fieldset>

          <Divider />

          <Button
            variant="tertiary"
            disabled={!dash.filtersActive}
            onClick={actions.clearFilters}
          >
            Clear filters
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Queue pane ------------------------------------------------------------

function QueuePane({ dash }: { dash: ReturnType<typeof useDashboard> }) {
  const { actions } = dash;

  if (dash.phase === "error") {
    return (
      <Card>
        <CardHeader>Incident queue</CardHeader>
        <CardContent>
          <AlertNotice status="error">
            <Stack variant="vertical">
              <Text as="p">
                {dash.errorMessage ?? "Failed to load incidents."}
              </Text>
              <Button variant="primary" onClick={actions.retry}>
                Retry
              </Button>
            </Stack>
          </AlertNotice>
        </CardContent>
      </Card>
    );
  }

  if (dash.phase === "loading") {
    return (
      <Card>
        <CardHeader>Incident queue</CardHeader>
        <CardContent>
          <Stack variant="vertical">
            <Skeleton variant="text" lines={6} ariaLabel="Loading incidents" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (dash.incidents.length === 0) {
    return (
      <Card>
        <CardHeader>Incident queue</CardHeader>
        <CardContent>
          <Alert intent="info" level="section">
            No incidents match the current filters.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>Incident queue ({dash.incidents.length})</CardHeader>
      <CardContent>
        <Table responsive ariaLabel="Incident queue">
          <TableHead>
            <TableRow>
              <TableHeaderCell scope="col">ID</TableHeaderCell>
              <TableHeaderCell scope="col">Title</TableHeaderCell>
              <TableHeaderCell scope="col">Service</TableHeaderCell>
              <TableHeaderCell scope="col">Severity</TableHeaderCell>
              <TableHeaderCell scope="col">Env</TableHeaderCell>
              <TableHeaderCell scope="col">Age</TableHeaderCell>
              <TableHeaderCell scope="col">Assignee</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dash.incidents.map((incident) => {
              const isSelected = incident.id === dash.selectedId;
              return (
                <TableRow
                  key={incident.id}
                  className={isSelected ? "ops-row-selected" : undefined}
                >
                  <TableCell>
                    {/* Row selection: the package Table exposes no row-select
                        channel, so selection is driven by an in-cell Button
                        (package-owned focus/press) and the app tracks the id.
                        See README findings: the selected-row visual indication
                        is app CSS, a recorded boundary gap. */}
                    <Button
                      variant="ghost"
                      size="small"
                      ariaPressed={isSelected}
                      onClick={() => actions.selectIncident(incident.id)}
                    >
                      {incident.id}
                    </Button>
                  </TableCell>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>{incident.service}</TableCell>
                  <TableCell>
                    <Badge
                      variant="status"
                      intent={severityIntent(incident.severity)}
                    >
                      {SEVERITY_LABEL[incident.severity]}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.environment}</TableCell>
                  <TableCell>{formatAge(incident.openedAt)}</TableCell>
                  <TableCell>{incident.assignee ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- Detail pane -----------------------------------------------------------

function DetailPane({
  dash,
  selected,
}: {
  dash: ReturnType<typeof useDashboard>;
  selected: Incident | null;
}) {
  const { actions } = dash;

  if (!selected) {
    return (
      <Card>
        <CardHeader>Detail</CardHeader>
        <CardContent>
          <Alert intent="info" level="section">
            Select an incident from the queue to see its detail and timeline.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>{selected.id}</CardHeader>
      <CardContent>
        <Stack variant="vertical">
          <Text as="h2" variant="heading" size="md" weight="bold">
            {selected.title}
          </Text>
          <Stack variant="horizontal">
            <Badge variant="status" intent={severityIntent(selected.severity)}>
              {SEVERITY_LABEL[selected.severity]}
            </Badge>
            <Status status={serviceStatusIntent("degraded")}>
              {selected.service}
            </Status>
            <Text as="span" size="sm">
              {selected.environment} · opened {formatAge(selected.openedAt)} ago ·{" "}
              {selected.assignee ? `@${selected.assignee}` : "unassigned"}
            </Text>
          </Stack>

          {dash.detailLoading || !dash.detail ? (
            <Skeleton variant="text" lines={4} ariaLabel="Loading detail" />
          ) : (
            <>
              <Text as="p">{dash.detail.description}</Text>

              <Details summary={`Timeline (${dash.detail.timeline.length})`}>
                <DetailsContent>
                  <Stack variant="vertical" as="ol">
                    {dash.detail.timeline.map((ev, idx) => (
                      <li key={`${ev.at}-${idx}`}>
                        <Text as="span" size="sm" weight="medium">
                          {ev.kind}
                        </Text>{" "}
                        <Text as="span" size="sm">
                          {ev.message} ({formatAge(ev.at)})
                        </Text>
                      </li>
                    ))}
                  </Stack>
                </DetailsContent>
              </Details>
            </>
          )}

          <Divider />

          <Stack variant="horizontal">
            <Button variant="secondary" onClick={actions.openAssign}>
              Assign
            </Button>
            <Button variant="destructive" onClick={actions.openResolve}>
              Resolve &amp; close
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
