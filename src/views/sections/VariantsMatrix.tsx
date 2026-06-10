import type { ComponentBundle } from "../../types/data";
import { bundle } from "../../types/bundle";
import { FrameworkPreview } from "../../runtime/FrameworkPreview";
import { buildReactDemo } from "../../runtime/demos";
import {
  materialTokenRows,
  tokenOverridesToCss,
} from "../../components/properties-panel/control-derivation";

interface VariantsMatrixProps {
  component: ComponentBundle;
  /**
   * Live token overrides from the Properties tab (slot → value). Appended to the
   * preview's tokensCss as CSS-custom-property overrides so editing a token
   * re-skins every variant cell live, with no module rebuild.
   */
  tokenOverrides?: Record<string, string>;
}

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((acc, curr) => {
    return acc.flatMap((a) => curr.map((c) => [...a, c]));
  }, [[]]);
}

export function VariantsMatrix({
  component,
  tokenOverrides,
}: VariantsMatrixProps) {
  const variants = component.contract.variants ?? {};
  const keys = Object.keys(variants);
  const reactSource = component.sources.react;

  // Live token-override CSS, injected into each preview iframe AFTER load (via
  // FrameworkPreview.overrideCss) so it re-skins without reloading the cell.
  // Uses the derived token rows so each override also targets its resolvesTo
  // semantic var (variant rules re-derive the slot var — see tokenOverridesToCss).
  const tokens = materialTokenRows(component);
  const overrideCss =
    tokenOverrides && Object.keys(tokenOverrides).length > 0
      ? tokenOverridesToCss(tokenOverrides, tokens)
      : "";

  if (keys.length === 0) return null;

  const valueLists = keys.map((k) => variants[k]);
  // Cap combinations to keep the page light.
  const combos = cartesian(valueLists).slice(0, 36);

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <span>
          {keys.length === 1
            ? `${combos.length} variant${combos.length === 1 ? "" : "s"}`
            : `${combos.length} combination${combos.length === 1 ? "" : "s"} · ${keys.join(" × ")}`}
        </span>
        <span className="subtle">React preview</span>
      </div>
      <div className="matrix">
        {combos.map((combo, i) => {
          const props: Record<string, string> = {};
          combo.forEach((val, idx) => {
            props[keys[idx]] = val;
          });
          return (
            <div className="matrix-cell" key={i}>
              <div className="preview-frame">
                {reactSource?.component ? (
                  <FrameworkPreview
                    framework="react"
                    componentName={component.name}
                    componentSource={reactSource.component}
                    css={reactSource.css}
                    tokensCss={bundle.tokensCss}
                    overrideCss={overrideCss}
                    demo={buildReactDemo(component, props)}
                    height={120}
                    interactive={false}
                  />
                ) : (
                  <span className="muted">No preview</span>
                )}
              </div>
              <div className="matrix-meta">
                {keys.map((k) => (
                  <span className="pill pill--mono" key={k}>
                    {k}={String(props[k])}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
