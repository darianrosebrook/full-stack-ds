import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { elementToCanvasMatrix, multiply, transformPoint } from "../projection";
import { untransformPoint, viewportToTrackpadUV } from "./trackpad";

// A laptop-like screen seen in perspective from above and to the side, so the
// matrix carries a real projective (w) row, not just an affine one.
function obliqueScreenMatrix() {
  const camera = new THREE.PerspectiveCamera(40, 1440 / 900, 0.1, 100);
  camera.position.set(0.25, 5.2, 5.6);
  camera.lookAt(0, 0.55, -0.7);
  camera.updateMatrixWorld();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.75));
  mesh.position.set(0, 1, -1);
  mesh.rotation.x = -0.33;
  mesh.updateMatrixWorld();
  const mvp = multiply(camera.projectionMatrix.elements, multiply(camera.matrixWorldInverse.elements, mesh.matrixWorld.elements));
  return elementToCanvasMatrix({
    modelViewProjection: mvp,
    planeWidth: 2.8,
    planeHeight: 1.75,
    elementWidth: 1280,
    elementHeight: 800,
    canvasWidth: 1440,
    canvasHeight: 900,
  });
}

describe("untransformPoint", () => {
  it("recovers the element point a projected canvas point came from", () => {
    const m = obliqueScreenMatrix();
    expect(m[3] !== 0 || m[7] !== 0).toBe(true);
    for (const [x, y] of [[0, 0], [1280, 0], [1280, 800], [0, 800], [313, 571]]) {
      const p = transformPoint(m, x, y);
      const back = untransformPoint(m, p.x, p.y)!;
      expect(back.x).toBeCloseTo(x, 6);
      expect(back.y).toBeCloseTo(y, 6);
    }
  });

  it("returns null for an edge-on plane", () => {
    const edgeOn = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    expect(untransformPoint(edgeOn, 10, 10)).toBeNull();
  });
});

describe("viewportToTrackpadUV", () => {
  it("is the pointer's fraction of the laptop viewport", () => {
    expect(viewportToTrackpadUV({ x: 320, y: 600 }, { width: 1280, height: 800 })).toEqual({ u: 0.25, v: 0.75 });
  });

  it("pins a pointer outside the viewport to the pad's nearest edge", () => {
    expect(viewportToTrackpadUV({ x: -50, y: 900 }, { width: 1280, height: 800 })).toEqual({ u: 0, v: 1 });
  });
});
