<script lang="ts">
// See ui.ts for why these are relative imports rather than
// `@full-stack-ds/svelte` package-form imports (dist is not built; the
// package's export map is dist-only).
import Badge from "../../ds-svelte/src/components/Badge/Badge.svelte";
import Card from "../../ds-svelte/src/components/Card/Card.svelte";
import Progress from "../../ds-svelte/src/components/Progress/Progress.svelte";
import Table from "../../ds-svelte/src/components/Table/Table.svelte";
import TableBody from "../../ds-svelte/src/components/Table/TableBody.svelte";
import TableCell from "../../ds-svelte/src/components/Table/TableCell.svelte";
import TableHead from "../../ds-svelte/src/components/Table/TableHead.svelte";
import TableHeaderCell from "../../ds-svelte/src/components/Table/TableHeaderCell.svelte";
import TableRow from "../../ds-svelte/src/components/Table/TableRow.svelte";
import Tabs from "../../ds-svelte/src/components/Tabs/Tabs.svelte";
import TabsList from "../../ds-svelte/src/components/Tabs/TabsList.svelte";
import TabsPanel from "../../ds-svelte/src/components/Tabs/TabsPanel.svelte";
import TabsTab from "../../ds-svelte/src/components/Tabs/TabsTab.svelte";
import type {
  ComponentSummary,
  FigmaUiModel,
  MaterializationReport,
  PluginToUiMessage,
  UiToPluginMessage,
} from "./ui-model";

type DraftState = {
  description: string;
  variantLabels: Record<string, Record<string, string>>;
};

let model: FigmaUiModel | null = $state(null);
let selectedName = $state<string | null>(null);
let filter = $state("");
let statusFilter = $state<"all" | "sets" | "deferred" | "blocked">("all");
let activeTab = $state("overview");
let lastReport: MaterializationReport | null = $state(null);
let errorMessage: string | null = $state(null);
let drafts = $state<Record<string, DraftState>>({});

const selected = $derived(
  model?.summaries.find((summary) => summary.name === selectedName) ??
    model?.summaries[0] ??
    null,
);

const filteredSummaries = $derived(
  (model?.summaries ?? []).filter((summary) => {
    const matchesText =
      filter.trim() === "" ||
      summary.name.toLowerCase().includes(filter.trim().toLowerCase()) ||
      summary.cssPrefix.toLowerCase().includes(filter.trim().toLowerCase());
    if (!matchesText) return false;
    if (statusFilter === "sets") {
      return summary.materializationStatus === "component_set_materialized";
    }
    if (statusFilter === "deferred") {
      return summary.materializationStatus !== "component_set_materialized";
    }
    if (statusFilter === "blocked") {
      return summary.audit.some((item) => item.severity === "blocked");
    }
    return true;
  }),
);

$effect(() => {
  if (!model || selectedName) return;
  selectedName = model.summaries[0]?.name ?? null;
});

$effect(() => {
  const width = Math.min(Math.max(window.innerWidth, 720), 980);
  postToPlugin({ type: "fsds:resize", width, height: 720 });
});

window.addEventListener("message", (event: MessageEvent) => {
  const pluginMessage = event.data?.pluginMessage as PluginToUiMessage | undefined;
  if (!pluginMessage) return;
  if (pluginMessage.type === "fsds:init") {
    model = pluginMessage.model;
    selectedName = pluginMessage.model.summaries[0]?.name ?? null;
    errorMessage = null;
  } else if (pluginMessage.type === "fsds:materialization-complete") {
    lastReport = pluginMessage.report;
    errorMessage = null;
  } else if (pluginMessage.type === "fsds:error") {
    errorMessage = pluginMessage.message;
  }
});

function postToPlugin(message: UiToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

function currentDraft(summary: ComponentSummary): DraftState {
  if (!drafts[summary.name]) {
    drafts[summary.name] = {
      description: "",
      variantLabels: Object.fromEntries(
        summary.variantAxes.map((axis) => [
          axis.name,
          Object.fromEntries(axis.values.map((value) => [value, value])),
        ]),
      ),
    };
  }
  return drafts[summary.name];
}

function setVariantLabel(
  summary: ComponentSummary,
  axisName: string,
  value: string,
  label: string,
): void {
  const draft = currentDraft(summary);
  draft.variantLabels[axisName] = {
    ...draft.variantLabels[axisName],
    [value]: label,
  };
  drafts = { ...drafts, [summary.name]: draft };
}

function setDescription(summary: ComponentSummary, value: string): void {
  const draft = currentDraft(summary);
  draft.description = value;
  drafts = { ...drafts, [summary.name]: draft };
}

function statusLabel(summary: ComponentSummary): string {
  if (summary.materializationStatus === "component_set_materialized") return "set";
  if (summary.materializationStatus === "placeholder_deferred") return "deferred";
  if (summary.materializationStatus === "placeholder_missing_css") return "blocked";
  if (summary.materializationStatus === "placeholder_no_variants") return "leaf";
  return "review";
}

function statusIntent(summary: ComponentSummary): "success" | "warning" | "danger" | "info" {
  if (summary.materializationStatus === "component_set_materialized") return "success";
  if (summary.audit.some((item) => item.severity === "blocked")) return "danger";
  if (summary.materializationStatus === "placeholder_deferred") return "warning";
  return "info";
}

function actionSummary(report: MaterializationReport): string {
  return [
    `${report.materialized.length} set${report.materialized.length === 1 ? "" : "s"}`,
    `${report.placeholders.length} placeholder${report.placeholders.length === 1 ? "" : "s"}`,
    `${report.skipped.length} skipped`,
  ].join(" / ");
}
</script>

{#if model}
  <main class="figma-ui">
    <header class="topbar">
      <div>
        <p class="eyebrow">Full Stack DS</p>
        <h1>Contract Materializer</h1>
      </div>
      <div class="topbar-actions">
        <button class="button button--small button--secondary" type="button" onclick={() => postToPlugin({ type: "fsds:materialize", scope: "allowlist" })}>
          Materialize allowlist
        </button>
        <button class="button button--small button--ghost" type="button" onclick={() => postToPlugin({ type: "fsds:close" })}>
          Close
        </button>
      </div>
    </header>

    {#if errorMessage}
      <div class="notice notice--danger" role="alert">{errorMessage}</div>
    {/if}

    {#if lastReport}
      <div class="notice">
        Last run: {actionSummary(lastReport)}
      </div>
    {/if}

    <section class="metrics" aria-label="Materialization summary">
      <Card density="inset" class="metric">
        <span class="metric-value">{model.componentCount}</span>
        <span class="metric-label">Descriptors</span>
      </Card>
      <Card density="inset" class="metric">
        <span class="metric-value">{model.componentSetCount}</span>
        <span class="metric-label">Component sets</span>
      </Card>
      <Card density="inset" class="metric">
        <span class="metric-value">{model.placeholderCount}</span>
        <span class="metric-label">Placeholders</span>
      </Card>
      <Card density="inset" class="metric">
        <span class="metric-value">{model.blockedCount}</span>
        <span class="metric-label">Blocked</span>
      </Card>
    </section>

    <div class="workspace">
      <aside class="component-rail" aria-label="Components">
        <div class="rail-controls">
          <input
            class="search-input"
            aria-label="Filter components"
            placeholder="Filter components"
            bind:value={filter}
          />
          <select class="select-input" aria-label="Filter materialization status" bind:value={statusFilter}>
            <option value="all">All</option>
            <option value="sets">Sets</option>
            <option value="deferred">Deferred</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div class="component-list">
          {#each filteredSummaries as summary (summary.name)}
            <button
              type="button"
              class:active={summary.name === selected?.name}
              class="component-row"
              onclick={() => {
                selectedName = summary.name;
                activeTab = "overview";
              }}
            >
              <span>
                <strong>{summary.name}</strong>
                <small>{summary.variantCellCount || 1} output shape{(summary.variantCellCount || 1) === 1 ? "" : "s"}</small>
              </span>
              <Badge variant="status" intent={statusIntent(summary)} size="sm">{statusLabel(summary)}</Badge>
            </button>
          {/each}
        </div>
      </aside>

      {#if selected}
        <section class="detail">
          <div class="detail-header">
            <div>
              <p class="eyebrow">{selected.rootElement} · .{selected.cssPrefix}</p>
              <h2>{selected.name}</h2>
            </div>
            <div class="detail-actions">
              <Badge variant="status" intent={statusIntent(selected)} size="md">{statusLabel(selected)}</Badge>
              <button
                class="button button--small button--secondary"
                type="button"
                disabled={selected.materializationStatus !== "component_set_materialized"}
                onclick={() => postToPlugin({ type: "fsds:materialize", scope: "selected", componentName: selected.name })}
              >
                Materialize
              </button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => (activeTab = value)} appearance="pills" class="detail-tabs">
            <TabsList>
              <TabsTab value="overview">Overview</TabsTab>
              <TabsTab value="variants">Variants</TabsTab>
              <TabsTab value="audit">Audit</TabsTab>
              <TabsTab value="metadata">Metadata</TabsTab>
            </TabsList>
            <TabsPanel value="overview">
              <div class="overview-grid">
                <Card density="inset" class="overview-card">
                  <span class="stat-label">Props</span>
                  <span class="stat-value">{selected.propCount}</span>
                  <span class="stat-note">{selected.requiredPropCount} required</span>
                </Card>
                <Card density="inset" class="overview-card">
                  <span class="stat-label">Anatomy</span>
                  <span class="stat-value">{selected.anatomyCount}</span>
                  <span class="stat-note">parts</span>
                </Card>
                <Card density="inset" class="overview-card">
                  <span class="stat-label">Variant cells</span>
                  <span class="stat-value">{selected.variantCellCount}</span>
                  <span class="stat-note">{selected.variantAxes.length} axes</span>
                </Card>
                <Card density="inset" class="overview-card">
                  <span class="stat-label">CSS blocks</span>
                  <span class="stat-value">{selected.cssBlockCount}</span>
                  <span class="stat-note">{selected.hasBaseCssBlock ? "base connected" : "base missing"}</span>
                </Card>
              </div>
              <Progress value={selected.materializationStatus === "component_set_materialized" ? 100 : selected.hasBaseCssBlock ? 64 : 28} />
            </TabsPanel>

            <TabsPanel value="variants">
              {#if selected.variantAxes.length === 0}
                <p class="empty-state">No variant axes are present in this descriptor.</p>
              {:else}
                <div class="variant-editor">
                  {#each selected.variantAxes as axis (axis.name)}
                    <section class="axis-panel">
                      <header>
                        <h3>{axis.name}</h3>
                        <span>{axis.values.length} values</span>
                      </header>
                      <Table ariaLabel={`${axis.name} variant labels`}>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Contract value</TableHeaderCell>
                            <TableHeaderCell>Figma label draft</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {#each axis.values as value (value)}
                            <TableRow>
                              <TableCell><code>{value}</code></TableCell>
                              <TableCell>
                                <input
                                  class="table-input"
                                  value={currentDraft(selected).variantLabels[axis.name]?.[value] ?? value}
                                  aria-label={`${axis.name} ${value} display label`}
                                  oninput={(event) =>
                                    setVariantLabel(
                                      selected,
                                      axis.name,
                                      value,
                                      (event.currentTarget as HTMLInputElement).value,
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          {/each}
                        </TableBody>
                      </Table>
                    </section>
                  {/each}
                </div>
              {/if}
            </TabsPanel>

            <TabsPanel value="audit">
              <div class="audit-list">
                {#each selected.audit as item}
                  <div class={`audit-item audit-item--${item.severity}`}>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>
                {/each}
              </div>
            </TabsPanel>

            <TabsPanel value="metadata">
              <div class="metadata-form">
                <label>
                  <span>Description draft</span>
                  <textarea
                    value={currentDraft(selected).description}
                    placeholder="Add a designer-facing description for review"
                    oninput={(event) => setDescription(selected, (event.currentTarget as HTMLTextAreaElement).value)}
                  ></textarea>
                </label>
                <Table ariaLabel="Descriptor metadata">
                  <TableBody>
                    <TableRow>
                      <TableCell>Component set</TableCell>
                      <TableCell><code>{selected.descriptor.figma?.componentSetName ?? selected.name}</code></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Documentation frame</TableCell>
                      <TableCell><code>{selected.descriptor.figma?.documentationFrame ?? "not declared"}</code></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>{selected.effectiveRole ?? "none"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell><code>{selected.descriptor.figma?.propertySource ?? "descriptor"}</code></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsPanel>
          </Tabs>
        </section>
      {/if}
    </div>
  </main>
{:else}
  <main class="figma-ui figma-ui--loading">
    <p class="eyebrow">Full Stack DS</p>
    <h1>Loading descriptors</h1>
  </main>
{/if}
