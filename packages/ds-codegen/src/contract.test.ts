import { describe, it, expect } from "vitest";
import { normalizeStates } from "./contract.js";

// CONTRACT-DIMENSIONAL-STATES-AUTHORITY-01 / A4: normalizeStates derives the
// flat selector-key list from the dimensional form. The derived `flat` must
// carry the active selector keys (hover/focus/disabled/checked) the legacy flat
// arrays produced — NOT the dimension defaults (rest/enabled/unchecked) — so
// generated output is byte-equivalent across the migration.
describe("normalizeStates: dimensional -> flat selector projection", () => {
  it("excludes each dimension's initial (base/absence) value from flat", () => {
    const n = normalizeStates({
      dimensions: {
        pointer: {
          category: "interaction",
          values: ["default", "hover", "active"],
          initial: "default",
          exclusive: true,
        },
        availability: {
          category: "availability",
          values: ["enabled", "disabled"],
          initial: "enabled",
          exclusive: true,
          suppresses: { categories: ["interaction"] },
        },
        selection: {
          category: "selection",
          values: ["unchecked", "checked"],
          initial: "unchecked",
          exclusive: true,
          a11y: { attribute: "aria-checked", values: { unchecked: "false", checked: "true" } },
        },
      },
    });
    // Active selector keys present; dimension defaults absent.
    expect(n.flat).toEqual(["hover", "active", "disabled", "checked"]);
    expect(n.flat).not.toContain("default");
    expect(n.flat).not.toContain("enabled");
    expect(n.flat).not.toContain("unchecked");
  });

  it("excludes channel-derived values from flat (surfaced via channel, not a CSS modifier)", () => {
    // Dialog's openness: fully channel-driven -> contributes nothing to flat,
    // so no .dialog--open modifier is introduced.
    const n = normalizeStates({
      dimensions: {
        openness: {
          category: "visibility",
          values: ["closed", "opening", "open", "closing"],
          initial: "closed",
          exclusive: true,
          derivesFrom: {
            opening: { channel: "openness" },
            open: { channel: "openness" },
            closing: { channel: "openness" },
          },
        },
      },
    });
    expect(n.flat).toEqual([]);
  });

  it("keeps a non-channel-marked value in flat even when the dimension is channel-backed", () => {
    // Sheet's asymmetry: `open` stays a CSS modifier (.sheet--open) while
    // opening/closing are channel-derived — faithfully preserving the
    // pre-existing per-component difference vs Dialog.
    const n = normalizeStates({
      dimensions: {
        openness: {
          category: "visibility",
          values: ["closed", "opening", "open", "closing"],
          initial: "closed",
          exclusive: true,
          derivesFrom: {
            opening: { channel: "openness" },
            closing: { channel: "openness" },
          },
        },
      },
    });
    expect(n.flat).toEqual(["open"]);
  });

  it("dedupes selector keys shared across dimensions, first-seen order", () => {
    const n = normalizeStates({
      dimensions: {
        a: { category: "validation", values: ["valid", "error"], initial: "valid", exclusive: true },
        b: { category: "data", values: ["idle", "error"], initial: "idle", exclusive: true },
      },
    });
    expect(n.flat).toEqual(["error"]);
  });

  it("returns flat:[] and dimensions:null when states are omitted", () => {
    expect(normalizeStates(undefined)).toEqual({ flat: [], dimensions: null });
  });

  it("preserves the dimensions object for downstream emitters", () => {
    const states = {
      dimensions: {
        focus: {
          category: "interaction" as const,
          values: ["unfocused", "focus"],
          initial: "unfocused",
          exclusive: true,
        },
      },
    };
    const n = normalizeStates(states);
    expect(n.dimensions).toBe(states.dimensions);
    expect(n.flat).toEqual(["focus"]);
  });
});
