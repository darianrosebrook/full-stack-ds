// TokenValueControl — app-specific control for a single token-backed value.
//
// It is NOT a new design-system primitive: it is composed entirely of the
// system's own outputs — the DS `Popover`, plain inputs/buttons styled with
// `--fsds-` tokens, and the existing `TokenPicker`. It is the shared editor for
// any value that resolves to a token: a box-model dimension, a radius, a fill
// color. The `◇` marker indicates the value is token-linked; clicking opens a
// popover with a literal editor (number stepper for dimensions, hex+swatch for
// colors) AND the token picker to rebind to a different token.
//
// "Resolve the value, but mark it linked with ◇" — the trigger shows the
// resolved literal (e.g. "8px" / "#d9292b"); the ◇ is filled when the slot has
// a resolvesTo binding, hollow when it's a raw literal override.

import { useState } from "react";
import { Popover } from "@full-stack-ds/react";
import type { FoundationToken } from "../../types/data";
import { TokenPicker, type TokenPick } from "./TokenPicker";

export interface TokenValueControlProps {
  /** The resolved literal currently shown (e.g. "8px", "#d9292b"). */
  value: string;
  /** True when this value is currently bound to a token (drives ◇ fill). */
  linked: boolean;
  /** "dimension" → number stepper; "color" → hex + swatch. */
  kind: "dimension" | "color";
  /** Commit a literal value edit. */
  onChange: (value: string) => void;
  /** Rebind to a token (the picker returns its resolved value + path). */
  onBindToken: (pick: TokenPick) => void;
  /** Palette for the picker. */
  foundationTokens: FoundationToken[];
  /** Step for the number stepper (default 1). */
  step?: number;
  /** Accessible name for the value, e.g. the slot it edits. */
  label: string;
  /** Compact trigger (used inside the dense box-model diagram). */
  compact?: boolean;
  /**
   * Restrict the rebind picker to a token-path family (e.g. /shape\.radius/ for
   * a radius control). Forwarded to TokenPicker.pathPattern.
   */
  pathPattern?: RegExp;
}

const DIM_RE = /^(-?\d*\.?\d+)([a-z%]*)$/i;

/** Split "12px" → [12, "px"]; falls back to [NaN, ""] for non-dimensional. */
function splitDimension(v: string): [number, string] {
  const m = DIM_RE.exec(v.trim());
  if (!m) return [NaN, ""];
  return [Number(m[1]), m[2] || ""];
}

function isHex(v: string): boolean {
  return /^#[0-9a-f]{3,8}$/i.test(v.trim());
}

export function TokenValueControl({
  value,
  linked,
  kind,
  onChange,
  onBindToken,
  foundationTokens,
  step = 1,
  label,
  compact,
  pathPattern,
}: TokenValueControlProps) {
  const [open, setOpen] = useState(false);
  const [num, unit] = splitDimension(value);

  function bump(delta: number) {
    if (Number.isNaN(num)) return;
    const next = num + delta;
    onChange(`${next}${unit}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom">
      <Popover.Trigger asChild>
        <button
          type="button"
          className={
            "fsds-tvc__trigger" + (compact ? " fsds-tvc__trigger--compact" : "")
          }
          aria-label={`Edit ${label}`}
          title={linked ? `${label} — token-linked` : label}
        >
          {kind === "color" && isHex(value) && (
            <span
              className="fsds-tvc__swatch"
              style={{ background: value }}
              aria-hidden
            />
          )}
          <span className="fsds-tvc__value">
            {value === ""
              ? "0"
              : compact && kind === "dimension"
                ? // On the dense diagram, show the bare number (strip the `px`
                  // unit) like the Figma — the full value is in the popover.
                  value.replace(/px$/i, "")
                : value}
          </span>
          <span
            className={
              "fsds-tvc__diamond" +
              (linked ? " fsds-tvc__diamond--linked" : "")
            }
            aria-hidden
          >
            {linked ? "◆" : "◇"}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Content className="fsds-tvc__popover">
        <div className="fsds-tvc__editor">
          {kind === "dimension" ? (
            <div className="fsds-tvc__stepper">
              <button
                type="button"
                className="fsds-tvc__step"
                onClick={() => bump(-step)}
                aria-label={`Decrease ${label}`}
                disabled={Number.isNaN(num)}
              >
                −
              </button>
              <input
                className="fsds-tvc__input"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={`${label} value`}
              />
              <button
                type="button"
                className="fsds-tvc__step"
                onClick={() => bump(step)}
                aria-label={`Increase ${label}`}
                disabled={Number.isNaN(num)}
              >
                +
              </button>
            </div>
          ) : (
            <div className="fsds-tvc__color-row">
              <input
                type="color"
                className="fsds-tvc__color-swatch"
                value={isHex(value) && value.length >= 7 ? value : "#000000"}
                onChange={(e) => onChange(e.target.value)}
                aria-label={`${label} color`}
              />
              <input
                className="fsds-tvc__input"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={`${label} value`}
              />
            </div>
          )}
        </div>
        <div className="fsds-tvc__picker">
          <TokenPicker
            tokens={foundationTokens}
            valueKind={kind === "color" ? "color" : "dimension"}
            pathPattern={pathPattern}
            onPick={(pick) => {
              onBindToken(pick);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        </div>
      </Popover.Content>
    </Popover>
  );
}
