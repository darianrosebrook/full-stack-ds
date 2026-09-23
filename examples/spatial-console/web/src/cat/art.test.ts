import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { TaperedTube, seededRandom, woodPlan } from "./art";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

describe("seededRandom", () => {
  it("repeats its sequence for a seed and differs across seeds", () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    const c = seededRandom(8);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    for (const x of seqA) expect(x >= 0 && x < 1).toBe(true);
  });
});

describe("woodPlan", () => {
  it("is identical for the same seed, so the desk looks the same every load", () => {
    expect(woodPlan(42)).toEqual(woodPlan(42));
    expect(woodPlan(42)).not.toEqual(woodPlan(43));
  });

  it("splits every row into contiguous boards with at least one end joint", () => {
    const plan = woodPlan(42, 6);
    expect(plan.rows).toHaveLength(6);
    for (const boards of plan.rows) {
      expect(boards.length).toBeGreaterThanOrEqual(2);
      expect(boards[0].x0).toBe(0);
      expect(boards.at(-1)!.x1).toBe(1);
      for (let i = 1; i < boards.length; i++) expect(boards[i].x0).toBe(boards[i - 1].x1);
      for (const b of boards) expect(b.x1).toBeGreaterThan(b.x0);
    }
  });

  it("varies board tone, so planks do not read as one flat colour", () => {
    const tones = woodPlan(42).rows.flat().map((b) => b.tone);
    expect(Math.max(...tones) - Math.min(...tones)).toBeGreaterThan(0.05);
  });
});

describe("TaperedTube", () => {
  it("places each ring on the curve at the radius asked for that point", () => {
    const tube = new TaperedTube(4, 8);
    const curve = new THREE.LineCurve3(v(0, 0, 0), v(0, 0, 4));
    tube.update(curve, (u) => 0.5 - 0.4 * u);
    const pos = tube.geometry.attributes.position;
    for (let i = 0; i <= 4; i++) {
      const center = v(0, 0, i);
      const r = 0.5 - 0.4 * (i / 4);
      for (let j = 0; j <= 8; j++) {
        const k = i * 9 + j;
        const p = v(pos.getX(k), pos.getY(k), pos.getZ(k));
        expect(p.z).toBeCloseTo(i, 5);
        expect(p.distanceTo(center)).toBeCloseTo(r, 5);
      }
    }
    expect(tube.geometry.index!.count).toBe(4 * 8 * 6);
  });
});
