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

  // Helper: render a TokenValueControl for a role, or null if the component has
  // no token for it (so the diagram only shows what the contract owns).
  function control(role: BoxModelRole, kind: "dimension" | "color" = "dimension") {
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
        onChange={(v) => onChange(row.slot, v)}
        onBindToken={(pick) => onBindToken(row.slot, pick)}
        foundationTokens={foundationTokens}
        pathPattern={boxModelRolePathPattern(role)}
      />
    );
  }

  const radius = byRole.get("radius");
  const minWidth = byRole.get("min-width");
  const border = byRole.get("border");

  // The center card shows the resolved min-width (a real token) as the size
  // proxy; components don't carry an explicit width/height the way canvas nodes
  // do, so min-width is the closest contract fact.
  const centerLabel = minWidth
    ? `min ${shownValue(minWidth.row, values)}`
    : "size";

  return (
    <div className="fsds-bme" role="group" aria-label="Box model">
      {/* center axes */}
      <div className="fsds-bme__axis fsds-bme__axis--v" aria-hidden />
      <div className="fsds-bme__axis fsds-bme__axis--h" aria-hidden />

      {/* border ring control (outer), shown only if a border token exists */}
      {border && (
        <div className="fsds-bme__border-tag" title="border width">
          {control("border")}
        </div>
      )}

      {/* cyan padding box */}
      <div className="fsds-bme__padding-box">
        {/* corner radius circles — all bound to the single radius token */}
        {radius &&
          (["tl", "tr", "bl", "br"] as const).map((corner) => (
            <div
              key={corner}
              className={`fsds-bme__radius fsds-bme__radius--${corner}`}
            >
              {control("radius")}
            </div>
          ))}

        {/* padding side controls, on the cyan band */}
        <div className="fsds-bme__pad fsds-bme__pad--top">
          {control("padding-top")}
        </div>
        <div className="fsds-bme__pad fsds-bme__pad--bottom">
          {control("padding-bottom")}
        </div>
        <div className="fsds-bme__pad fsds-bme__pad--left">
          {control("padding-left")}
        </div>
        <div className="fsds-bme__pad fsds-bme__pad--right">
          {control("padding-right")}
        </div>

        {/* dashed green inner content zone */}
        <div className="fsds-bme__content-box">
          {/* center card: resolved size proxy (read-only) + gap control */}
          <div className="fsds-bme__center" aria-label="size">
            <span className="fsds-bme__center-size">{centerLabel}</span>
            {byRole.get("gap") && (
              <span className="fsds-bme__gap" title="gap">
                {control("gap")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
