// Pure projection math: given where a panel mesh sits in the 3D scene, compute
// the 4x4 matrix that maps the drawable DOM element's border box (CSS px, origin
// top-left) onto the pixels that mesh covers in the canvas (CSS px). Assigning
// this matrix to the element — via `updateElementGeometry({ canvasTransform })`
// or, on older builds, a CSS `matrix3d` transform — is what makes a real pointer
// event land on the DS control that is visibly under the cursor in the scene.
//
// All matrices are column-major Float64 arrays, the layout shared by three.js
// `Matrix4.elements`, `DOMMatrix.fromFloat64Array`, and CSS `matrix3d()`.

export type Mat4 = readonly number[];

export function multiply(a: Mat4, b: Mat4): number[] {
  const out = new Array<number>(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

export interface PanelProjectionInput {
  /** projection * view * model for the panel mesh, column-major. */
  modelViewProjection: Mat4;
  /** Panel plane size in world units (a PlaneGeometry centred on its origin). */
  planeWidth: number;
  planeHeight: number;
  /** Drawable element border-box size in CSS px. */
  elementWidth: number;
  elementHeight: number;
  /** Canvas size in CSS px. */
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Element px -> plane-local world units. Element (0,0) is the plane's top-left
 * corner; element +y runs down while plane +y runs up.
 */
export function elementToPlane(
  planeWidth: number,
  planeHeight: number,
  elementWidth: number,
  elementHeight: number,
): number[] {
  const sx = planeWidth / elementWidth;
  const sy = -planeHeight / elementHeight;
  // prettier-ignore
  return [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, 1, 0,
    -planeWidth / 2, planeHeight / 2, 0, 1,
  ];
}

/** Clip space -> canvas CSS px, keeping w so the browser does the divide. */
export function clipToCanvas(canvasWidth: number, canvasHeight: number): number[] {
  const hw = canvasWidth / 2;
  const hh = canvasHeight / 2;
  // prettier-ignore
  return [
    hw, 0, 0, 0,
    0, -hh, 0, 0,
    0, 0, 1, 0,
    hw, hh, 0, 1,
  ];
}

export function elementToCanvasMatrix(input: PanelProjectionInput): number[] {
  return multiply(
    clipToCanvas(input.canvasWidth, input.canvasHeight),
    multiply(
      input.modelViewProjection,
      elementToPlane(input.planeWidth, input.planeHeight, input.elementWidth, input.elementHeight),
    ),
  );
}

/** Apply a column-major 4x4 to a 2D point on z=0 and perspective-divide. */
export function transformPoint(m: Mat4, x: number, y: number): { x: number; y: number; w: number } {
  const X = m[0] * x + m[4] * y + m[12];
  const Y = m[1] * x + m[5] * y + m[13];
  const W = m[3] * x + m[7] * y + m[15];
  return { x: X / W, y: Y / W, w: W };
}

/**
 * Whether the panel's front face points at the camera. Uses the projected
 * winding of three corners: a front-facing plane keeps element-space winding
 * (clockwise on screen with y down), a back-facing one mirrors it.
 */
export function isFrontFacing(m: Mat4, elementWidth: number, elementHeight: number): boolean {
  const a = transformPoint(m, 0, 0);
  const b = transformPoint(m, elementWidth, 0);
  const c = transformPoint(m, 0, elementHeight);
  if (a.w <= 0 || b.w <= 0 || c.w <= 0) return false;
  const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return cross > 0;
}
