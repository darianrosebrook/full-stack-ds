import { describe, expect, it } from "vitest";
import { Wobble, clampToReach, pressAgainst } from "./reach";

const box = { minX: -4, maxX: 3, minZ: -1, maxZ: 4 };
const cup = { x: -2.3, z: -1.75, r: 0.85 };

describe("clampToReach", () => {
  it("leaves a point inside the box where it is", () => {
    expect(clampToReach({ x: 1, z: 2 }, box, cup)).toEqual({ x: 1, z: 2 });
  });

  it("leaves a point inside the mug's disc where it is, though it is past the box's back edge", () => {
    expect(clampToReach({ x: -2.3, z: -2.2 }, box, cup)).toEqual({ x: -2.3, z: -2.2 });
  });

  it("pins a point past the box's back edge, far from the mug, to that edge", () => {
    expect(clampToReach({ x: 2, z: -3 }, box, cup)).toEqual({ x: 2, z: -1 });
  });

  it("pins a point beyond the mug to the rim of its disc", () => {
    const p = clampToReach({ x: -2.3, z: -4 }, box, cup);
    expect(p.x).toBeCloseTo(-2.3, 9);
    expect(p.z).toBeCloseTo(-1.75 - 0.85, 9);
  });

  it("without a disc, pins a far point to the box even where the mug's disc would be nearer", () => {
    expect(clampToReach({ x: 0.6, z: -10 }, box, cup)).not.toEqual({ x: 0.6, z: -1 });
    expect(clampToReach({ x: 0.6, z: -10 }, box)).toEqual({ x: 0.6, z: -1 });
  });

  it("pins a point off the side of the scene to the box's side", () => {
    expect(clampToReach({ x: 9, z: 1 }, box, cup)).toEqual({ x: 3, z: 1 });
  });
});

describe("pressAgainst", () => {
  const centre = { x: 0, z: 0 };
  const from = { x: 0, z: 5 };

  it("does not touch a target short of the near face", () => {
    const r = pressAgainst({ x: 0, z: 1 }, from, centre, 0.5);
    expect(r).toMatchObject({ x: 0, z: 1, press: 0 });
  });

  it("puts a target inside the object on its near face, pressing by the overshoot", () => {
    const r = pressAgainst({ x: 0, z: 0.2 }, from, centre, 0.5);
    expect(r.x).toBeCloseTo(0, 9);
    expect(r.z).toBeCloseTo(0.5, 9);
    expect(r.press).toBeCloseTo(0.3, 9);
    expect(r.away).toEqual({ x: -0, z: -1 });
  });

  it("puts a target behind the object on the near face too, never the far side", () => {
    const r = pressAgainst({ x: 0.3, z: -2 }, from, centre, 0.5);
    expect(r.z).toBeGreaterThan(0);
    expect(Math.hypot(r.x, r.z)).toBeCloseTo(0.5, 9);
    expect(r.press).toBeCloseTo(0.4 + 2, 9);
  });

  it("does not touch a target that passes beside the object", () => {
    expect(pressAgainst({ x: 0.6, z: 0 }, from, centre, 0.5).press).toBe(0);
  });

  it("signs the lateral offset by which side of the face was hit", () => {
    const left = pressAgainst({ x: -0.2, z: 0 }, from, centre, 0.5).lateral;
    const right = pressAgainst({ x: 0.2, z: 0 }, from, centre, 0.5).lateral;
    expect(Math.sign(left)).toBe(-Math.sign(right));
    expect(Math.abs(left)).toBeCloseTo(0.2, 9);
  });
});

describe("Wobble", () => {
  const run = (w: Wobble, seconds: number, rest?: { x: number; z: number }) => {
    let peak = 0;
    for (let t = 0; t < seconds; t += 1 / 120) {
      w.step(1 / 120, rest);
      peak = Math.max(peak, w.magnitude);
    }
    return peak;
  };

  it("rocks past its rest after a knock and settles back upright", () => {
    const w = new Wobble(40, 3, 0.5);
    w.kick({ x: 1, z: 0 }, 3.4);
    const peak = run(w, 6);
    expect(peak).toBeGreaterThan(0.3);
    expect(peak).toBeLessThan(0.5);
    expect(w.magnitude).toBeLessThan(0.005);
  });

  it("never tilts past its limit however hard the knock", () => {
    const w = new Wobble(40, 3, 0.5);
    w.kick({ x: 0.6, z: -0.8 }, 50);
    expect(run(w, 3)).toBeLessThanOrEqual(0.5 + 1e-12);
  });

  it("leans toward a held rest and stays there", () => {
    const w = new Wobble(40, 3, 0.5);
    run(w, 6, { x: 0, z: 0.1 });
    expect(w.tilt.z).toBeCloseTo(0.1, 3);
    expect(w.tilt.x).toBeCloseTo(0, 6);
  });
});
