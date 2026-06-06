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
  type ControlDescriptor,
  type TokenRowDescriptor,
} from "./control-derivation";
import { TokenPicker, type TokenPick } from "./TokenPicker";
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
      return (
        <label className="fsds-pp__toggle">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            aria-label={control.label}
          />
          <span>{value ? "on" : "off"}</span>
        </label>
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

  function applyPick(pick: TokenPick) {
    if (pickerSlot) onTokenChange(pickerSlot, pick.value);
    setPickerSlot(null);
  }

  return (
    <div className="fsds-pp">
      <div className="fsds-pp__header">
        <span className="fsds-pp__title">{component.name}</span>
        <span className="fsds-pp__layer">{component.contract.layer}</span>
      </div>

      {variantAxes.length > 0 && (
        <section className="fsds-pp__section" aria-label="Variants">
          <h3 className="fsds-pp__section-title">Variants</h3>
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
        </section>
      )}

      {props.length > 0 && (
        <section className="fsds-pp__section" aria-label="Properties">
          <h3 className="fsds-pp__section-title">Properties</h3>
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
        </section>
      )}

      {tokens.length > 0 && (
        <section className="fsds-pp__section" aria-label="Component tokens">
          <h3 className="fsds-pp__section-title">Component tokens</h3>
          {tokens.map((row) => (
            <div className="fsds-pp__field fsds-pp__field--token" key={row.slot}>
              <label className="fsds-pp__label fsds-pp__label--token" title={row.resolvesTo}>
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
        </section>
      )}

      {pickerRow && (
        <div className="fsds-pp__picker-overlay" onClick={() => setPickerSlot(null)}>
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
