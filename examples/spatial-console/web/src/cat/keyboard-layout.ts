// Physical keyboard geometry for the typing cat. Keys are identified by
// `KeyboardEvent.code` (the physical key, layout-independent), laid out as a
// compact laptop keyboard in key units (1u = one letter key).

export type Paw = "left" | "right" | "both";

export interface KeyCell {
  code: string;
  row: number;
  /** Key centre, in key units from the row's left edge. */
  x: number;
  width: number;
}

type RowSpec = [code: string, width?: number][];

const letters = (s: string): RowSpec => [...s].map((c) => [`Key${c}`]);
const digits = (s: string): RowSpec => [...s].map((c) => [`Digit${c}`]);

const ROWS: RowSpec[] = [
  [["Backquote"], ...digits("1234567890"), ["Minus"], ["Equal"], ["Backspace", 1.5]],
  [["Tab", 1.5], ...letters("QWERTYUIOP"), ["BracketLeft"], ["BracketRight"], ["Backslash"]],
  [["CapsLock", 1.75], ...letters("ASDFGHJKL"), ["Semicolon"], ["Quote"], ["Enter", 1.75]],
  [["ShiftLeft", 2.25], ...letters("ZXCVBNM"), ["Comma"], ["Period"], ["Slash"], ["ShiftRight", 2.25]],
  [["Fn"], ["ControlLeft"], ["AltLeft"], ["MetaLeft", 1.25], ["Space", 5], ["MetaRight", 1.25], ["AltRight"], ["ArrowLeft"], ["ArrowUp"], ["ArrowRight"]],
];

/** Row width of the widest row, in key units; every row is centred on it. */
export const KEYBOARD_WIDTH_UNITS = 14.5;
export const KEYBOARD_ROWS = ROWS.length;

export const KEY_CELLS: ReadonlyMap<string, KeyCell> = (() => {
  const cells = new Map<string, KeyCell>();
  ROWS.forEach((row, rowIndex) => {
    const total = row.reduce((sum, [, w = 1]) => sum + w, 0);
    let cursor = (KEYBOARD_WIDTH_UNITS - total) / 2;
    for (const [code, width = 1] of row) {
      cells.set(code, { code, row: rowIndex, x: cursor + width / 2, width });
      cursor += width;
    }
  });
  // ArrowDown shares the ArrowUp slot on a laptop's half-height arrow cluster.
  const up = cells.get("ArrowUp")!;
  cells.set("ArrowDown", { ...up, code: "ArrowDown" });
  return cells;
})();

/**
 * The touch-typing split: 1–5 / QWERT / ASDFG / ZXCVB and the modifiers left
 * of them belong to the left paw, everything else to the right, Space to both.
 */
const LEFT_PAW = new Set([
  "Escape", "Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5",
  "Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT",
  "CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG",
  "ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB",
  "Fn", "ControlLeft", "AltLeft", "MetaLeft",
]);

export function pawForCode(code: string): Paw {
  if (code === "Space") return "both";
  return LEFT_PAW.has(code) ? "left" : "right";
}

export function keyCell(code: string): KeyCell | null {
  return KEY_CELLS.get(code) ?? null;
}
