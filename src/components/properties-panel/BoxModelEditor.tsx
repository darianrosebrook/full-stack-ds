// BoxModelEditor — the nested padding/size/radius/border diagram, recreated for
// this repo from the interactive-ui-editor's BoxModelEditor (which was Tailwind/
// Radix). Here it's plain CSS with --fsds- tokens and binds to a component's
// CONTRACT box-model tokens (discovered via resolveBoxModel) rather than raw
// CanvasElement geometry.
//
// Differences from the original, per design decisions:
//   - Margins are DROPPED — components don't own outer margin tokens.
//   - The 4 corner-radius circles are all bound to the SAME radius token (one
//     value for all corners), matching the contract's single radius slot.
//   - Border thickness sits on the outer ring; min-width shows in the center.
//   - Every editable value is a TokenValueControl (◇ marks token-linked), whose
//     popover gives a number stepper + the token picker.
//
// Visual zones (mirrors the studied design): an outer container with a pink
// vertical + blue horizontal center axis; a cyan padding box; a dashed green
// inner content zone; a center card showing the resolved min-width × min-height;
// pink corner circles for radius.

import type { FoundationToken } from "../../types/data";
import {
  resolveBoxModel,
  deriveBoxConstraints,
  boxModelRolePathPattern,
  type BoxModelBinding,
  type BoxModelRole,
  type TokenRowDescriptor,
} from "./control-derivation";
import { TokenValueControl } from "./TokenValueControl";
import type { TokenPick } from "./TokenPicker";

interface BoxModelEditorProps {
  /** The component's token rows (from deriveControls). */
  tokens: TokenRowDescriptor[];
  /** Current literal overrides keyed by slot (panel state). */
  values: Record<string, string>;
  /** Commit a literal edit for a slot. */
  onChange: (slot: string, value: string) => void;
  /** Rebind a slot to a token. */
  onBindToken: (slot: string, pick: TokenPick) => void;
  foundationTokens: FoundationToken[];
}

/** The effective shown value for a row: override → fallback → "". */
function shownValue(
  row: TokenRowDescriptor,
  values: Record<string, string>,
): string {
  return values[row.slot] ?? row.fallback ?? "";
}

/** A slot is "linked" (◆) when it has a resolvesTo and no raw override. */
function isLinked(
  row: TokenRowDescriptor,
  values: Record<string, string>,
): boolean {
  return !!row.resolvesTo && !(row.slot in values);
}

export function BoxModelEditor({
  tokens,
  values,
  onChange,
  onBindToken,
  foundationTokens,
}: BoxModelEditorProps) {
  const bindings = resolveBoxModel(tokens);
  const byRole = new Map<BoxModelRole, BoxModelBinding>(
    bindings.map((b) => [b.role, b]),
  );
  const constraints = deriveBoxConstraints(bindings);

  // Helper: render a TokenValueControl for a role, or null if the component has
  // no token for it (so the diagram only shows what the contract owns).
  function control(
    role: BoxModelRole,
    kind: "dimension" | "color" = "dimension",
    title: string,
  ) {
    const b = byRole.get(role);
    if (!b) return null;
    const row = b.row;
    return (
      <TokenValueControl
        compact
        kind={kind}
        label={row.slot}
        value={shownValue(row, values)}
        linked={isLinked(row, values)}
        provenance={row.source}
        overridden={row.slot in values}
        onChange={(v) => onChange(row.slot, v)}
        onBindToken={(pick) => onBindToken(row.slot, pick)}
        foundationTokens={foundationTokens}
        pathPattern={boxModelRolePathPattern(role)}
        title={title}
      />
    );
  }

  const radius = byRole.get("radius");
  const border = byRole.get("border");

  // Center card: a W × H proxy per axis — the min-* floor when one is
  // meaningfully set, else the fixed extent (fixed-square glyphs, linear
  // meters). With the material surface every component carries primitive
  // min-* rows valued "0"; those are real slots but not a meaningful size to
  // headline, so an axis only contributes when its row is authored/profile
  // sourced or carries a live override.
  function axisRow(...roles: BoxModelRole[]): TokenRowDescriptor | null {
    for (const role of roles) {
      const b = byRole.get(role);
      if (!b) continue;
      if (b.row.source !== "primitive-default" || b.row.slot in values) {
        return b.row;
      }
    }
    return null;
  }
  const wRow = axisRow("min-width", "width");
  const hRow = axisRow("min-height", "height");
  const w = wRow ? shownValue(wRow, values) : null;
  const h = hRow ? shownValue(hRow, values) : null;
  const centerLabel = w && h ? `${w} × ${h}` : (w ?? h ?? "auto");

  return (
    <>
    <div className="fsds-bme" role="group" aria-label="Box model">
      {/* center axes */}
      <div className="fsds-bme__axis fsds-bme__axis--v" aria-hidden />
      <div className="fsds-bme__axis fsds-bme__axis--h" aria-hidden />

      {/* cyan padding box (border band) */}
      <div className="fsds-bme__padding-box">
        {/* corner radius circles — all bound to the single radius token */}
        {radius &&
          (["tl", "tr", "bl", "br"] as const).map((corner) => (
            <div
              key={corner}
              className={`fsds-bme__radius fsds-bme__radius--${corner}`}
            >
              {control("radius", "dimension", `Radius ${corner}`)}
            </div>
          ))}

        {/* border value labels on the cyan-box edges (all bound to one border
            token, so editing any updates the single border slot) */}
        {border && (
          <>
            <div className="fsds-bme__border-val fsds-bme__border-val--top">
              {control("border", "dimension", `Border top`)}
            </div>
            <div className="fsds-bme__border-val fsds-bme__border-val--bottom">
              {control("border", "dimension", `Border bottom`)}
            </div>
            <div className="fsds-bme__border-val fsds-bme__border-val--left">
              {control("border", "dimension", `Border left`)}
            </div>
            <div className="fsds-bme__border-val fsds-bme__border-val--right">
              {control("border", "dimension", `Border right`)}
            </div>
          </>
        )}

        {/* green dashed padding zone */}
        <div className="fsds-bme__pad-zone">
          {/* padding value labels on the green-zone edges */}
          <div className="fsds-bme__pad fsds-bme__pad--top">
            {control("padding-top", "dimension", "Padding top")}
          </div>
          <div className="fsds-bme__pad fsds-bme__pad--bottom">
            {control("padding-bottom", "dimension", "Padding bottom")}
          </div>
          <div className="fsds-bme__pad fsds-bme__pad--left">
            {control("padding-left", "dimension", "Padding left")}
          </div>
          <div className="fsds-bme__pad fsds-bme__pad--right">
            {control("padding-right", "dimension", "Padding right")}
          </div>

          {/* white content card: resolved size proxy (read-only) + gap */}
          <div className="fsds-bme__center" aria-label="size">
            <span className="fsds-bme__center-size">{centerLabel}</span>
            {byRole.get("gap") && (
              <span className="fsds-bme__gap" title="gap">
                {control("gap", "dimension", "Gap")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* per-axis constraint captions: why a small padding edit can look inert */}
    {constraints.length > 0 && (
      <ul className="fsds-bme-constraints" aria-label="Dimensional constraints">
        {constraints.map((c) => {
          const floorVal = c.floor ? shownValue(c.floor, values) : "";
          const capVal = c.cap ? shownValue(c.cap, values) : "";
          return (
            <li key={c.axis} className="fsds-bme-constraint">
              <span className="fsds-bme-constraint__dim">{c.label}</span>
              {c.floor && (
                <span className="fsds-bme-constraint__bound">
                  ≥ {floorVal || "min"}
                  <span
                    className="fsds-bme-constraint__diamond"
                    aria-hidden
                    title={
                      isLinked(c.floor, values)
                        ? `bound to ${c.floor.resolvesTo}`
                        : "literal override"
                    }
                  >
                    {isLinked(c.floor, values) ? "◆" : "◇"}
                  </span>
                </span>
              )}
              {c.cap && (
                <span className="fsds-bme-constraint__bound">
                  ≤ {capVal || "max"}
                </span>
              )}
              <span className="fsds-bme-constraint__note">
                padding only grows past the {c.floor ? "floor" : "cap"}
              </span>
            </li>
          );
        })}
      </ul>
    )}
    </>
  );
}
