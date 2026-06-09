// Scratch page for designing the Figma-style properties panel before it lands
// in TracePanel. Two panes: a live config-mode React preview on the left, the
// PropertiesPanel on the right. State (selected component + prop/token
// overrides) lives here; changes flow to the preview as an fsds:config payload
// over the wire — no module rebuild per edit.
//
// Reachable only at #/scratch/properties-panel (not in the Sidebar nav). It is
// a design surface, not a shipped feature, until the panel is approved.

import { useMemo, useState } from "react";
import { bundle } from "../types/bundle";
import { FrameworkPreview } from "../runtime/FrameworkPreview";
import { PropertiesPanel } from "../components/properties-panel/PropertiesPanel";
import {
  buildPropMap,
  deriveControls,
  tokenOverridesToCss,
} from "../components/properties-panel/control-derivation";

// Seed set: three components that exercise different control kinds. Button is
// the Figma reference (enum variant axes + color tokens); Truncate exercises
// number/boolean/text props; Switch adds a single-axis + boolean/callback mix.
// The remaining corpus is wired in once the mechanism is proven.
const SEED_COMPONENTS = ["Button", "Truncate", "Switch"];

export function PropertiesScratchView() {
  const seed = useMemo(
    () =>
      bundle.components.filter((c) => SEED_COMPONENTS.includes(c.name)),
    [],
  );

  const [activeName, setActiveName] = useState(
    () => seed[0]?.name ?? bundle.components[0]?.name ?? "",
  );
  const component =
    seed.find((c) => c.name === activeName) ??
    bundle.components.find((c) => c.name === activeName) ??
    null;

  // Per-component override state, keyed by component name so switching the
  // component preserves each one's edits during a session.
  const [propOverrides, setPropOverrides] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [tokenOverrides, setTokenOverrides] = useState<
    Record<string, Record<string, string>>
  >({});

  const propValues = propOverrides[activeName] ?? {};
  const tokenValues = tokenOverrides[activeName] ?? {};

  const config = useMemo(() => {
    if (!component) return undefined;
    // Pass the derived token rows so overrides also target each slot's
    // resolvesTo semantic var — the leaf a variant rule reads, which is what
    // makes the live re-skin win over variant modifiers (e.g. .button--primary).
    const { tokens } = deriveControls(component.contract);
    return {
      props: buildPropMap(component.contract, propValues),
      tokenCss: tokenOverridesToCss(tokenValues, tokens),
    };
  }, [component, propValues, tokenValues]);

  if (!component) {
    return (
      <div className="page">
        <h1 className="page-title">No seed components found</h1>
      </div>
    );
  }

  const reactSource = component.sources.react;

  return (
    <div className="page">
      <h1 className="page-title">Properties panel — scratch</h1>
      <p className="page-lede">
        Design surface for the Figma-style properties panel. Edits drive the
        live preview over the <code>fsds:config</code> wire. Not in nav; reach
        it at <code>#/scratch/properties-panel</code>.
      </p>

      <div className="fsds-scratch">
        <div className="fsds-scratch__stage">
          <div className="fsds-scratch__picker">
            <label htmlFor="fsds-scratch-component">Component</label>
            <select
              id="fsds-scratch-component"
              value={activeName}
              onChange={(e) => setActiveName(e.target.value)}
            >
              {seed.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="fsds-scratch__preview">
            {reactSource?.component ? (
              <FrameworkPreview
                framework="react"
                componentName={component.name}
                componentSource={reactSource.component}
                css={reactSource.css}
                tokensCss={bundle.tokensCss}
                // demo is unused in config mode (the entry mounts a persistent
                // render target), but the prop is required; pass empty.
                demo=""
                height={280}
                config={config}
              />
            ) : (
              <span className="muted">No React preview for {component.name}</span>
            )}
          </div>
        </div>

        <aside className="fsds-scratch__inspector">
          <PropertiesPanel
            component={component}
            propValues={propValues}
            onPropChange={(name, value) =>
              setPropOverrides((prev) => ({
                ...prev,
                [activeName]: { ...(prev[activeName] ?? {}), [name]: value },
              }))
            }
            tokenValues={tokenValues}
            onTokenChange={(slot, value) =>
              setTokenOverrides((prev) => ({
                ...prev,
                [activeName]: { ...(prev[activeName] ?? {}), [slot]: value },
              }))
            }
            foundationTokens={bundle.foundationTokens}
          />
        </aside>
      </div>
    </div>
  );
}
