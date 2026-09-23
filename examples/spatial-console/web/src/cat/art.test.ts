import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { TaperedTube, seededRandom, solveArm, solveArmAboveFloor, woodPlan } from "./art";

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

describe("solveArm", () => {
  const pole = v(1, 0, 0);

  it("keeps both bone lengths and bends the elbow toward the pole for a target in reach", () => {
    const shoulder = v(0, 1, 0);
    const wrist = v(0, 0, -2);
    const pose = solveArm(shoulder, wrist, 1.4, 1.5, pole, 0.4);
    expect(pose.slide).toBe(0);
    expect(pose.stretch).toBe(1);
    expect(pose.shoulder.distanceTo(shoulder)).toBe(0);
    expect(pose.elbow.distanceTo(pose.shoulder)).toBeCloseTo(1.4, 6);
    expect(pose.elbow.distanceTo(wrist)).toBeCloseTo(1.5, 6);
    // A real bend: the elbow sits off the shoulder-wrist line, on the pole side.
    expect(pose.elbow.x).toBeGreaterThan(0.5);
  });

  it("bends toward whichever side the pole names", () => {
    const left = solveArm(v(0, 1, 0), v(0, 0, -2), 1.4, 1.5, v(-1, 0, 0), 0.4);
    expect(left.elbow.x).toBeLessThan(-0.5);
  });

  it("slides the shoulder toward an out-of-reach wrist before stretching, and never moves the wrist", () => {
    const shoulder = v(0, 0, 0);
    const wrist = v(0, 0, -3.1);
    const pose = solveArm(shoulder, wrist, 1.5, 1.5, pole, 0.4);
    const reach = 3 * 0.995;
    expect(pose.slide).toBeCloseTo(3.1 - reach, 6);
    expect(pose.stretch).toBe(1);
    expect(pose.shoulder.z).toBeCloseTo(-(3.1 - reach), 6);
    expect(pose.elbow.distanceTo(pose.shoulder)).toBeCloseTo(1.5, 6);
    expect(pose.elbow.distanceTo(wrist)).toBeCloseTo(1.5, 6);
  });

  it("stretches both bones equally only once the slide limit is spent", () => {
    const wrist = v(0, 0, -4);
    const pose = solveArm(v(0, 0, 0), wrist, 1.5, 1.5, pole, 0.4);
    expect(pose.slide).toBeCloseTo(0.4, 6);
    const reach = 3 * 0.995;
    expect(pose.stretch).toBeCloseTo(3.6 / reach, 6);
    expect(pose.elbow.distanceTo(pose.shoulder)).toBeCloseTo(1.5 * pose.stretch, 5);
    expect(pose.elbow.distanceTo(wrist)).toBeCloseTo(1.5 * pose.stretch, 5);
  });

  it("still finds a bend when the pole is parallel to the arm", () => {
    const pose = solveArm(v(0, 0, 0), v(2, 0, 0), 1.4, 1.5, v(1, 0, 0), 0.4);
    expect(Number.isFinite(pose.elbow.x)).toBe(true);
    expect(pose.elbow.distanceTo(v(0, 0, 0))).toBeCloseTo(1.4, 6);
    expect(Math.abs(pose.elbow.y) + Math.abs(pose.elbow.z)).toBeGreaterThan(0.3);
  });
});

describe("solveArmAboveFloor", () => {
  const tucked = v(0, -1, 1);
  const flared = v(1, 0.5, 0);

  it("keeps the preferred (tucked) bend when its elbow clears the floor", () => {
    const pose = solveArmAboveFloor(v(0, 1.5, 0), v(0, 1.2, -1.8), 1.1, 1.15, [tucked, flared], 0.6, 0.1);
    expect(pose.elbow.y).toBeGreaterThanOrEqual(0.1);
    expect(pose.elbow.x).toBeCloseTo(0, 6);
    expect(pose.elbow.y).toBeLessThan(1.2);
  });

  it("falls back to the next pole when the tucked elbow would sink below the floor", () => {
    const shoulder = v(0, 0.6, 0);
    const wrist = v(0, 0.35, -1.6);
    // Precondition: the tucked bend alone really does go through the floor.
    expect(solveArm(shoulder, wrist, 1.1, 1.15, tucked, 0.6).elbow.y).toBeLessThan(0.1);
    const pose = solveArmAboveFloor(shoulder, wrist, 1.1, 1.15, [tucked, flared], 0.6, 0.1);
    expect(pose.elbow.y).toBeGreaterThanOrEqual(0.1);
    expect(pose.elbow.x).toBeGreaterThan(0.3);
    expect(pose.elbow.distanceTo(pose.shoulder)).toBeCloseTo(1.1, 6);
    expect(pose.elbow.distanceTo(wrist)).toBeCloseTo(1.15, 6);
  });

  it("returns the highest elbow when no pole clears the floor", () => {
    const shoulder = v(0, 0.2, 0);
    const wrist = v(0, 0.2, -1.5);
    const pose = solveArmAboveFloor(shoulder, wrist, 1.1, 1.15, [tucked, v(0, 0.2, 1), v(1, 0, 0)], 0.6, 5);
    expect(pose.elbow.y).toBeCloseTo(solveArm(shoulder, wrist, 1.1, 1.15, v(0, 0.2, 1), 0.6).elbow.y, 6);
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
