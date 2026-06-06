// PropertiesPanel — the Figma-style inspector for a component's variants,
// props, and component-scoped tokens. Pure presentation over derived control
// descriptors; it owns no preview wiring. The parent (scratch view, later the
// TracePanel Properties tab) holds the override state and renders the live
// preview, so this component is reusable in both places.
//
// Layout mirrors the studied Figma right-rail panel:
//   header (component name + swap)
//   Variants    — labeled selects, one per variant axis, each with an
//                 "Apply variable" affordance
//   Properties  — typed prop controls (toggle/number/text/select)
//   Component tokens — swatch+value rows, each re-bindable via the token picker
//
// The chrome is intentionally custom (native controls restyled) rather than the
// DS's own composite components: the inspector is editor chrome, not part of
// the system being inspected — same separation Figma makes.

import { useState } from "react";
import type { ComponentBundle, FoundationToken } from "../../types/data";
import {
  deriveControls,
  resolveBoxModel,
  resolveFillColor,
  resolveTypography,
  boxModelRolePathPattern,
  typographyRolePathPattern,
  FILL_PATH_PATTERN,
  type BoxModelRole,
  type TypographyRole,
  type ControlDescriptor,
  type TokenRowDescriptor,
} from "./control-derivation";
import { TokenPicker, type TokenPick } from "./TokenPicker";
import { TokenValueControl } from "./TokenValueControl";
import { BoxModelEditor } from "./BoxModelEditor";
import { PropertySection } from "./PropertySection";
import { Switch } from "@full-stack-ds/react";
import "./properties-panel.css";

export interface PropertiesPanelProps {
  component: ComponentBundle;
  /** Current prop overrides (name → value). Controlled by the parent. */
  propValues: Record<string, unknown>;
  onPropChange: (name: string, value: unknown) => void;
  /** Current token overrides (slot → literal value). Controlled by the parent. */
  tokenValues: Record<string, string>;
  onTokenChange: (slot: string, value: string) => void;
  /** Resolved palette for the "Apply variable" picker. */
  foundationTokens: FoundationToken[];
}

/** Resolve the effective value for a control: override → default → "". */
function controlValue(
  control: ControlDescriptor,
  overrides: Record<string, unknown>,
): unknown {
  if (control.name in overrides) return overrides[control.name];
  return control.defaultValue;
}

function PropControl({
  control,
  value,
  onChange,
}: {
  control: ControlDescriptor;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (control.kind) {
    case "select":
      return (
        <select
          className="fsds-pp__input"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          aria-label={control.label}
        >
          {control.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "boolean":
      // NOT a <label>: the DS Switch renders its own <label>+input, so wrapping
      // it in another <label> nests labels — clicking the wrapper misroutes to
      // other switches (toggling several at once). A plain <span> is just layout;
      // the Switch carries its own labeling via aria-label.
      return (
        <span className="fsds-pp__toggle">
          <Switch
            checked={Boolean(value)}
            onChange={(checked) => onChange(checked)}
            aria-label={control.label}
          />
          <span>{value ? "on" : "off"}</span>
        </span>
      );
    case "number":
      return (
        <input
          className="fsds-pp__input"
          type="number"
          value={value === undefined || value === null ? "" : Number(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
          aria-label={control.label}
        />
      );
    case "text":
      return (
        <input
          className="fsds-pp__input"
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          aria-label={control.label}
        />
      );
  }
}

function TokenRow({
  row,
  value,
  onChange,
  onOpenPicker,
}: {
  row: TokenRowDescriptor;
  value: string;
  onChange: (v: string) => void;
  onOpenPicker: () => void;
}) {
  return (
    <div className="fsds-pp__token-row">
      {row.isColor ? (
        <input
          type="color"
          className="fsds-pp__swatch"
          // <input type=color> needs a hex; fall back to a neutral when the
          // value isn't a parseable hex (e.g. a token-bound rgb()) so the
          // native control stays usable. The text field below carries the
          // authoritative value.
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${row.slot} color`}
        />
      ) : (
        <span className="fsds-pp__swatch fsds-pp__swatch--dim" aria-hidden />
      )}
      <input
        className="fsds-pp__token-value"
        type="text"
        value={value}
        placeholder={row.fallback ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${row.slot} value`}
      />
      <button
        type="button"
        className="fsds-pp__bind"
        title={
          row.resolvesTo
            ? `Bound to ${row.resolvesTo} — click to rebind`
            : "Apply a token"
        }
        onClick={onOpenPicker}
        aria-label={`Apply token to ${row.slot}`}
      >
        ◇
      </button>
    </div>
  );
}

export function PropertiesPanel({
  component,
  propValues,
  onPropChange,
  tokenValues,
  onTokenChange,
  foundationTokens,
}: PropertiesPanelProps) {
  const { variantAxes, props, tokens } = deriveControls(component.contract);
  // Which token row's picker is open (by slot), and whether it's color-only.
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const pickerRow = tokens.find((t) => t.slot === pickerSlot) ?? null;

  // Role-resolved tokens for the Layout / Shape / Fill sections. Each maps to
  // the contract token that serves that role (match-by-use), discovered the same
  // way the box-model roles are — never hardcoded to a component.
  const byRole = new Map<BoxModelRole, TokenRowDescriptor>(
    resolveBoxModel(tokens).map((b) => [b.role, b.row]),
  );
  const widthRow = byRole.get("min-width");
  const heightRow = byRole.get("min-height");
  const radiusRow = byRole.get("radius");
  const fillRow = resolveFillColor(tokens);
  const hasLayout = !!(widthRow || heightRow);

  // Typography roles (font-size / font-weight / font-family) — same match-by-use
  // resolution; the section shows only the roles the component owns.
  const typography = resolveTypography(tokens);
  const typoByRole = new Map<TypographyRole, TokenRowDescriptor>(
    typography.map((b) => [b.role, b.row]),
  );
  const fontSizeRow = typoByRole.get("font-size");
  const fontWeightRow = typoByRole.get("font-weight");
  const fontFamilyRow = typoByRole.get("font-family");
  const hasTypography = typography.length > 0;

  function applyPick(pick: TokenPick) {
    if (pickerSlot) onTokenChange(pickerSlot, pick.value);
    setPickerSlot(null);
  }

  /** The effective value for a token row: override → fallback → "". */
  function rowValue(row: TokenRowDescriptor): string {
    return tokenValues[row.slot] ?? row.fallback ?? "";
  }
  /** A row is token-linked (◆) when it resolvesTo and has no raw override. */
  function rowLinked(row: TokenRowDescriptor): boolean {
    return !!row.resolvesTo && !(row.slot in tokenValues);
  }

  /** Render a (non-compact) TokenValueControl for a resolved token row. */
  function tokenField(
    row: TokenRowDescriptor,
    title: string,
    opts: { kind?: "dimension" | "color"; pathPattern?: RegExp } = {},
  ) {
    const kind = opts.kind ?? (row.isColor ? "color" : "dimension");
    return (
      <TokenValueControl
        kind={kind}
        title={title}
        label={row.slot}
        value={rowValue(row)}
        linked={rowLinked(row)}
        onChange={(v) => onTokenChange(row.slot, v)}
        onBindToken={(pick) => onTokenChange(row.slot, pick.value)}
        foundationTokens={foundationTokens}
        pathPattern={opts.pathPattern}
      />
    );
  }

  return (
    <div className="fsds-pp">
      <div className="fsds-pp__header">
        <span className="fsds-pp__title">{component.name}</span>
        <span className="fsds-pp__layer">{component.contract.layer}</span>
      </div>

      <PropertySection title="Box model">
        <BoxModelEditor
          tokens={tokens}
          values={tokenValues}
          onChange={onTokenChange}
          onBindToken={(slot, pick) => onTokenChange(slot, pick.value)}
          foundationTokens={foundationTokens}
        />
      </PropertySection>

      {variantAxes.length > 0 && (
        <PropertySection title="Variants">
          {variantAxes.map((axis) => (
            <div className="fsds-pp__field" key={axis.name}>
              <label className="fsds-pp__label">{axis.label}</label>
              <PropControl
                control={axis}
                value={controlValue(axis, propValues)}
                onChange={(v) => onPropChange(axis.name, v)}
              />
            </div>
          ))}
        </PropertySection>
      )}

      {props.length > 0 && (
        <PropertySection title="Properties">
          {props.map((control) => (
            <div className="fsds-pp__field" key={control.name}>
              <label className="fsds-pp__label" title={control.description}>
                {control.label}
              </label>
              <PropControl
                control={control}
                value={controlValue(control, propValues)}
                onChange={(v) => onPropChange(control.name, v)}
              />
            </div>
          ))}
        </PropertySection>
      )}

      {hasLayout && (
        <PropertySection title="Layout">
          <div className="fsds-pp__wh">
            {widthRow && (
              <div className="fsds-pp__wh-field">
                <span className="fsds-pp__wh-label" aria-hidden>
                  W
                </span>
                {tokenField(widthRow, "Width", {
                  kind: "dimension",
                  pathPattern: boxModelRolePathPattern("min-width"),
                })}
              </div>
            )}
            {heightRow && (
              <div className="fsds-pp__wh-field">
                <span className="fsds-pp__wh-label" aria-hidden>
                  H
                </span>
                {tokenField(heightRow, "Height", {
                  kind: "dimension",
                  pathPattern: boxModelRolePathPattern("min-height"),
                })}
              </div>
            )}
          </div>
        </PropertySection>
      )}

      {radiusRow && (
        <PropertySection title="Shape">
          <div className="fsds-pp__wh">
            <div className="fsds-pp__wh-field">
              <span
                className="fsds-pp__wh-label fsds-pp__wh-label--icon"
                aria-hidden
              >
                ⌜⌟
              </span>
              {tokenField(radiusRow, "Corner radius", {
                kind: "dimension",
                pathPattern: boxModelRolePathPattern("radius"),
              })}
            </div>
          </div>
        </PropertySection>
      )}

      {fillRow && (
        <PropertySection title="Fill">
          <div className="fsds-pp__wh">
            <div className="fsds-pp__wh-field fsds-pp__wh-field--wide">
              {tokenField(fillRow, "Fill", {
                kind: "color",
                pathPattern: FILL_PATH_PATTERN,
              })}
            </div>
          </div>
        </PropertySection>
      )}

      {hasTypography && (
        <PropertySection title="Typography">
          {fontFamilyRow && (
            <div className="fsds-pp__wh">
              <div className="fsds-pp__wh-field fsds-pp__wh-field--wide">
                <span className="fsds-pp__wh-label fsds-pp__wh-label--icon" aria-hidden>
                  Aa
                </span>
                {tokenField(fontFamilyRow, "Font family", {
                  kind: "dimension",
                  pathPattern: typographyRolePathPattern("font-family"),
                })}
              </div>
            </div>
          )}
          <div className="fsds-pp__wh">
            {fontSizeRow && (
              <div className="fsds-pp__wh-field">
                <span className="fsds-pp__wh-label fsds-pp__wh-label--icon" aria-hidden>
                  S
                </span>
                {tokenField(fontSizeRow, "Font size", {
                  kind: "dimension",
                  pathPattern: typographyRolePathPattern("font-size"),
                })}
              </div>
            )}
            {fontWeightRow && (
              <div className="fsds-pp__wh-field">
                <span className="fsds-pp__wh-label fsds-pp__wh-label--icon" aria-hidden>
                  W
                </span>
                {tokenField(fontWeightRow, "Font weight", {
                  kind: "dimension",
                  pathPattern: typographyRolePathPattern("font-weight"),
                })}
              </div>
            )}
          </div>
        </PropertySection>
      )}

      {tokens.length > 0 && (
        <PropertySection title="Component tokens" defaultOpen={false}>
          {tokens.map((row) => (
            <div
              className="fsds-pp__field fsds-pp__field--token"
              key={row.slot}
            >
              <label
                className="fsds-pp__label fsds-pp__label--token"
                title={row.resolvesTo}
              >
                {row.slot}
              </label>
              <TokenRow
                row={row}
                value={tokenValues[row.slot] ?? row.fallback ?? ""}
                onChange={(v) => onTokenChange(row.slot, v)}
                onOpenPicker={() => setPickerSlot(row.slot)}
              />
            </div>
          ))}
        </PropertySection>
      )}

      {pickerRow && (
        <div
          className="fsds-pp__picker-overlay"
          onClick={() => setPickerSlot(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <TokenPicker
              tokens={foundationTokens}
              colorOnly={pickerRow.isColor}
              onPick={applyPick}
              onClose={() => setPickerSlot(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
