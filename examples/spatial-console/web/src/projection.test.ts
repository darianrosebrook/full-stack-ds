import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { elementToCanvasMatrix, isFrontFacing, multiply, transformPoint } from "./projection";

const CANVAS = { width: 1280, height: 720 };
const ELEMENT = { width: 360, height: 280 };
const PLANE = { width: 1.8, height: 1.4 };

function panelMatrix(camera: THREE.PerspectiveCamera, mesh: THREE.Mesh): number[] {
  camera.updateMatrixWorld();
  mesh.updateMatrixWorld();
  const mvp = multiply(
    camera.projectionMatrix.elements,
    multiply(camera.matrixWorldInverse.elements, mesh.matrixWorld.elements),
  );
  return elementToCanvasMatrix({
    modelViewProjection: mvp,
    planeWidth: PLANE.width,
    planeHeight: PLANE.height,
    elementWidth: ELEMENT.width,
    elementHeight: ELEMENT.height,
    canvasWidth: CANVAS.width,
    canvasHeight: CANVAS.height,
  });
}

/** three.js's own world -> canvas px projection, the independent oracle. */
function threeProject(camera: THREE.PerspectiveCamera, mesh: THREE.Mesh, lx: number, ly: number) {
  const v = new THREE.Vector3(lx, ly, 0).applyMatrix4(mesh.matrixWorld).project(camera);
  return { x: ((v.x + 1) / 2) * CANVAS.width, y: ((1 - v.y) / 2) * CANVAS.height };
}

function obliqueScene() {
  const camera = new THREE.PerspectiveCamera(50, CANVAS.width / CANVAS.height, 0.1, 100);
  camera.position.set(1.2, 1.6, 4);
  camera.lookAt(0, 0.5, 0);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PLANE.width, PLANE.height));
  mesh.position.set(-1.1, 0.8, 0.6);
  mesh.rotation.set(-0.35, 0.55, 0.05);
  return { camera, mesh };
}

describe("elementToCanvasMatrix", () => {
  it("maps each element border-box corner onto the matching projected plane corner", () => {
    const { camera, mesh } = obliqueScene();
    const m = panelMatrix(camera, mesh);
    const corners: [number, number, number, number][] = [
      [0, 0, -PLANE.width / 2, PLANE.height / 2],
      [ELEMENT.width, 0, PLANE.width / 2, PLANE.height / 2],
      [0, ELEMENT.height, -PLANE.width / 2, -PLANE.height / 2],
      [ELEMENT.width, ELEMENT.height, PLANE.width / 2, -PLANE.height / 2],
    ];
    for (const [ex, ey, lx, ly] of corners) {
      const got = transformPoint(m, ex, ey);
      const want = threeProject(camera, mesh, lx, ly);
      expect(got.x).toBeCloseTo(want.x, 6);
      expect(got.y).toBeCloseTo(want.y, 6);
    }
  });

  it("keeps perspective foreshortening: an interior element point follows the projected plane point, not a linear blend of corners", () => {
    const { camera, mesh } = obliqueScene();
    const m = panelMatrix(camera, mesh);
    const got = transformPoint(m, ELEMENT.width * 0.25, ELEMENT.height * 0.75);
    const want = threeProject(camera, mesh, -PLANE.width / 4, -PLANE.height / 4);
    expect(got.x).toBeCloseTo(want.x, 6);
    expect(got.y).toBeCloseTo(want.y, 6);

    // The affine blend of the four projected corners lands elsewhere under
    // perspective; if it did not, this oracle could not tell a projective
    // matrix from an affine one.
    const tl = threeProject(camera, mesh, -PLANE.width / 2, PLANE.height / 2);
    const tr = threeProject(camera, mesh, PLANE.width / 2, PLANE.height / 2);
    const bl = threeProject(camera, mesh, -PLANE.width / 2, -PLANE.height / 2);
    const affineX = tl.x + 0.25 * (tr.x - tl.x) + 0.75 * (bl.x - tl.x);
    expect(Math.abs(affineX - want.x)).toBeGreaterThan(0.5);
  });
});

describe("isFrontFacing", () => {
  it("is true for a panel facing the camera and false once it is turned away", () => {
    const { camera, mesh } = obliqueScene();
    expect(isFrontFacing(panelMatrix(camera, mesh), ELEMENT.width, ELEMENT.height)).toBe(true);
    mesh.rotation.y += Math.PI;
    expect(isFrontFacing(panelMatrix(camera, mesh), ELEMENT.width, ELEMENT.height)).toBe(false);
  });

  it("is false for a panel behind the camera", () => {
    const { camera, mesh } = obliqueScene();
    mesh.position.set(1.2 * 3, 1.6 * 3, 12);
    mesh.lookAt(camera.position);
    expect(isFrontFacing(panelMatrix(camera, mesh), ELEMENT.width, ELEMENT.height)).toBe(false);
  });
});
