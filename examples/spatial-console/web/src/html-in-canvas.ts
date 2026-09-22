// Compatibility seam over the WICG HTML-in-Canvas API
// (https://github.com/WICG/html-in-canvas). The explainer and the shipping
// Chromium flag disagree while the proposal moves, so this module is the only
// place that knows both shapes:
//
//   explainer (current):   content="drawable", texElementSubImage2D,
//                          canvas.updateElementGeometry({ canvasTransform })
//   older Chromium builds: layoutsubtree, texElementImage2D(target, fmt, el),
//                          hit testing through the element's CSS transform
//
// Everything above this module speaks one vocabulary: a DrawableSurface is
// told when the canvas paints and where its element is drawn, and keeps the
// texture and the element's hit-test geometry in sync.

interface ElementImageLike {
  readonly width: number;
  readonly height: number;
  close?(): void;
}

export interface CanvasPaintEventLike extends Event {
  readonly changedElements?: readonly Element[];
}

interface DrawableCanvas extends HTMLCanvasElement {
  requestPaint(): void;
  captureElementImage?(element: Element): ElementImageLike;
  updateElementGeometry?(element: Element, options: { canvasTransform?: DOMMatrixInit }): void;
  onpaint: ((event: CanvasPaintEventLike) => void) | null;
}

interface DrawableGL extends WebGL2RenderingContext {
  texElementSubImage2D?(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    element: Element,
  ): void;
  texElementImage2D?(target: GLenum, internalformat: GLenum, element: Element): void;
}

export type GeometryMode = "updateElementGeometry" | "css-transform";

export type SupportReport =
  | { supported: true; upload: "texElementSubImage2D" | "texElementImage2D"; geometry: GeometryMode }
  | { supported: false; missing: string[] };

export function detectSupport(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext): SupportReport {
  const c = canvas as Partial<DrawableCanvas>;
  const g = gl as DrawableGL;
  const missing: string[] = [];
  if (typeof c.requestPaint !== "function") missing.push("HTMLCanvasElement.requestPaint");
  const upload =
    typeof g.texElementSubImage2D === "function" && typeof c.captureElementImage === "function"
      ? "texElementSubImage2D"
      : typeof g.texElementImage2D === "function"
        ? "texElementImage2D"
        : null;
  if (!upload) missing.push("WebGL2RenderingContext.texElementSubImage2D / texElementImage2D");
  if (missing.length || !upload) return { supported: false, missing };
  return {
    supported: true,
    upload,
    geometry: typeof c.updateElementGeometry === "function" ? "updateElementGeometry" : "css-transform",
  };
}

export function asDrawable(canvas: HTMLCanvasElement): DrawableCanvas {
  return canvas as DrawableCanvas;
}

/**
 * Copy the element's latest paint snapshot into `texture` (RGBA8, level 0,
 * rows flipped for GL). Only valid inside the canvas `paint` event. Leaves GL
 * state dirty; callers sharing the context with three.js must reset its state.
 */
function uploadElementTexture(
  canvas: DrawableCanvas,
  gl: DrawableGL,
  texture: WebGLTexture,
  element: Element,
): void {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  if (typeof gl.texElementSubImage2D === "function" && typeof canvas.captureElementImage === "function") {
    const image = canvas.captureElementImage(element);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, element);
    image.close?.();
  } else {
    gl.texElementImage2D!(gl.TEXTURE_2D, gl.RGBA8, element);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
}

/**
 * One drawable element bound to one GL texture.
 *
 * Geometry on the css-transform path goes on the element's *mount* — a
 * non-drawable parent wrapper — never on the drawable element itself. On the
 * Chromium builds that path exists for, a drawable element's own CSS transform
 * is baked into its snapshot (probed: translate(10px,5px) shifts the content
 * 10px inside the texture; a projected matrix3d moves it out entirely and the
 * upload is fully transparent), while an ancestor's transform leaves the
 * snapshot byte-identical to the untransformed one and still moves the
 * element's hit-test geometry. On the updateElementGeometry path the mount
 * stays untransformed and the browser receives the matrix directly.
 */
export class DrawableSurface {
  readonly texture: WebGLTexture;
  uploads = 0;
  private readonly mode: GeometryMode;
  private readonly mount: HTMLElement;
  private readonly layoutOffset: { x: number; y: number };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gl: WebGL2RenderingContext,
    readonly element: HTMLElement,
  ) {
    const mount = element.parentElement;
    if (!mount || mount === canvas || mount.parentElement !== canvas) {
      throw new Error(`#${element.id} must sit in a mount wrapper that is a direct child of the canvas`);
    }
    this.mount = mount;
    this.texture = gl.createTexture()!;
    this.mode = typeof asDrawable(canvas).updateElementGeometry === "function" ? "updateElementGeometry" : "css-transform";
    // A CSS transform composes on top of the mount's static layout position
    // inside the canvas, so that position is cancelled out of the matrix.
    // Measured once, before any transform is applied.
    const mountRect = mount.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    this.layoutOffset = { x: mountRect.left - canvasRect.left, y: mountRect.top - canvasRect.top };
  }

  get hasTexture(): boolean {
    return this.uploads > 0;
  }

  /**
   * Call from the canvas `paint` handler with the event's changed elements.
   * Returns true when it uploaded a new snapshot. The explainer lists the
   * changed drawable element; the css-transform builds list the canvas's
   * direct child instead (probed: a text change inside the drawable reports
   * only the mount), and also list the mount when its transform moves — so
   * either counts, at the cost of re-uploading while the camera moves.
   */
  paint(changedElements: ReadonlySet<Element>): boolean {
    const changed = changedElements.has(this.element) || changedElements.has(this.mount);
    if (this.hasTexture && !changed) return false;
    try {
      uploadElementTexture(asDrawable(this.canvas), this.gl as DrawableGL, this.texture, this.element);
    } catch {
      // No snapshot recorded for this element yet; the next paint retries.
      return false;
    }
    this.uploads++;
    return true;
  }

  /**
   * Tell the browser the element's border box is drawn at `elementToCanvas`
   * (column-major 4x4, element CSS px -> canvas CSS px).
   */
  setGeometry(elementToCanvas: readonly number[]): void {
    const matrix = DOMMatrix.fromFloat64Array(Float64Array.from(elementToCanvas));
    if (this.mode === "updateElementGeometry") {
      asDrawable(this.canvas).updateElementGeometry!(this.element, { canvasTransform: matrix });
      return;
    }
    this.mount.style.transform = new DOMMatrix()
      .translate(-this.layoutOffset.x, -this.layoutOffset.y)
      .multiply(matrix)
      .toString();
  }
}
