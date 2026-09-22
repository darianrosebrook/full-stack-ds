import { describe, expect, it } from "vitest";
import { KEY_CELLS, KEYBOARD_WIDTH_UNITS, keyCell, pawForCode } from "./keyboard-layout";

describe("pawForCode", () => {
  it("splits the letter rows between T|Y, G|H and B|N, and the digits between 5|6", () => {
    for (const code of ["KeyT", "KeyG", "KeyB", "Digit5"]) expect(pawForCode(code)).toBe("left");
    for (const code of ["KeyY", "KeyH", "KeyN", "Digit6"]) expect(pawForCode(code)).toBe("right");
  });

  it("gives Space to both paws and unknown keys to the right paw", () => {
    expect(pawForCode("Space")).toBe("both");
    expect(pawForCode("F13")).toBe("right");
  });

  it("gives left-side modifiers to the left paw and right-side ones to the right", () => {
    expect(pawForCode("ShiftLeft")).toBe("left");
    expect(pawForCode("ShiftRight")).toBe("right");
    expect(pawForCode("Enter")).toBe("right");
  });
});

describe("keyCell", () => {
  it("places every left-paw key left of every right-paw key within the same row", () => {
    for (let row = 0; row < 4; row++) {
      const cells = [...KEY_CELLS.values()].filter((c) => c.row === row);
      const maxLeft = Math.max(...cells.filter((c) => pawForCode(c.code) === "left").map((c) => c.x));
      const minRight = Math.min(...cells.filter((c) => pawForCode(c.code) === "right").map((c) => c.x));
      expect(maxLeft).toBeLessThan(minRight);
    }
  });

  it("keeps each row inside the keyboard width with keys in order", () => {
    const q = keyCell("KeyQ")!;
    const w = keyCell("KeyW")!;
    expect(w.x - q.x).toBeCloseTo(1, 9);
    for (const cell of KEY_CELLS.values()) {
      expect(cell.x - cell.width / 2).toBeGreaterThanOrEqual(-1e-9);
      expect(cell.x + cell.width / 2).toBeLessThanOrEqual(KEYBOARD_WIDTH_UNITS + 1e-9);
    }
  });

  it("puts Space on the bottom row, centred, and returns null for unmapped codes", () => {
    const space = keyCell("Space")!;
    expect(space.row).toBe(4);
    expect(Math.abs(space.x - KEYBOARD_WIDTH_UNITS / 2)).toBeLessThan(1);
    expect(keyCell("F13")).toBeNull();
  });
});
