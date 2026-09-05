import {
  AlertNotice,
  Button,
  Chip,
  CodeSnippet,
  Icon,
  ShowMore,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tooltip,
  Truncate,
} from "@full-stack-ds/react";
import type { ComponentBundle, FoundationToken } from "../types/data";
import type { TraceSelection } from "../trace/types";
import { JsonTreeViewer } from "../components/JsonTreeViewer";
import { PropertiesPanel } from "../components/properties-panel/PropertiesPanel";

interface TracePanelProps {
  component: ComponentBundle | null;
  selection: TraceSelection | null;
  onClear: () => void;
  /** Live-edit override state for the Properties tab (lifted to App). */
  propValues: Record<string, unknown>;
  onPropChange: (name: string, value: unknown) => void;
  tokenValues: Record<string, string>;
  onTokenChange: (slot: string, value: string) => void;
  /** Clear every override for the active component. */
  onResetOverrides: () => void;
  foundationTokens: FoundationToken[];
}

export function TracePanel({
  component,
  selection,
  onClear,
  propValues,
  onPropChange,
  tokenValues,
  onTokenChange,
  onResetOverrides,
  foundationTokens,
}: TracePanelProps) {
  if (!component) {
    return (
      <div className="trace-empty">
        <AlertNotice status="info" level="inline" icon={<Icon name="info" size="sm" />}>
          Select a component to inspect its contract.
        </AlertNotice>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="properties"
      appearance="underline"
      aria-label="Inspector"
      className="trace-tabs"
    >
      <div className="trace-tabbar">
        <TabsList>
          <TabsTab value="properties">Properties</TabsTab>
          <TabsTab value="contract">Contract</TabsTab>
        </TabsList>
      </div>

      <TabsPanel value="properties" className="trace-panel-body trace-panel-body--flush">
        <PropertiesPanel
          component={component}
          propValues={propValues}
          onPropChange={onPropChange}
          tokenValues={tokenValues}
          onTokenChange={onTokenChange}
          onResetOverrides={onResetOverrides}
          foundationTokens={foundationTokens}
        />
      </TabsPanel>

      <TabsPanel value="contract" className="trace-panel-body">
        {selection ? (
          <Stack className="stack-gap-04" style={{ marginBottom: "var(--fsds-core-spacing-size-06)", fontSize: "var(--fsds-core-typography-ramp-2)" }}>
            <Tooltip placement="bottom">
              <Tooltip.Trigger asChild>
                <Chip size="small" variant="selected" style={{ fontFamily: "var(--fsds-core-typography-font-family-mono)" }}>
                  {selection.hit.kind}
                </Chip>
              </Tooltip.Trigger>
              <Tooltip.Content>The contract field family this region was generated from</Tooltip.Content>
            </Tooltip>
            <ShowMore maxLines={2}>
              {selection.hit.explanation}
            </ShowMore>
            <Truncate lines={1} expandable>
              <CodeSnippet as="code" text={selection.hit.contractPath} />
            </Truncate>
            <div>
              <Button variant="ghost" size="small" onClick={onClear}>
                Clear selection
              </Button>
            </div>
          </Stack>
        ) : (
          <p className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)", marginTop: 0 }}>
            Click any tagged region in the source on the Developer tab to highlight
            the contract field that produced it.
          </p>
        )}

        <JsonTreeViewer
          value={component.contract}
          highlightPath={selection?.hit.contractPath}
        />
      </TabsPanel>
    </Tabs>
  );
}
