# Spatial console

Generated DS components as **diegetic controls inside a 3D scene**. The page is one WebGL canvas (three.js). Three lecterns stand around a pedestal, and each lectern's screen is a live DS panel drawn into the scene through the WICG [HTML-in-Canvas](https://github.com/WICG/html-in-canvas) API:

| Panel | Framework | DS components | Drives |
|---|---|---|---|
| Lighting | React (`@full-stack-ds/react`) | Card, Switch, RadioGroup, Button | lamp on/off, lamp colour, light pulse |
| Motion | Vue (`@full-stack-ds/vue`) | Card, ToggleSwitch, RadioGroup ×2, Button | auto-rotate, object shape, speed, reset |
| Telemetry | Lit (`@full-stack-ds/lit`) | Card, Status, Progress, Stat, Button | readout of scene state; clear selection |

The panels are not an overlay. They are real DOM elements under the canvas: the browser lays them out, the scene uploads their paint snapshot as a texture on a panel mesh, and the scene assigns each element the projected geometry of that mesh. A pointer event at a spot on a lectern's screen reaches the DS control drawn there through the browser's own hit testing. Input flows both ways. Picking the object or the lamp bulb in 3D (raycast) updates the store, and the React and Lit panels re-render and re-upload.

## Claim this pressures

The public package exports of three framework targets can be composed in one page and put under a non-DOM presentation surface (a perspective-projected WebGL texture) without consumer access to renderer internals. All three panels share one framework-neutral store (`web/src/store.ts`). No panel imports another panel, and none reaches past its package's public exports.

## Running it

HTML-in-Canvas is behind a flag. Chrome 153 stable implements it when launched with:

```bash
--enable-features=CanvasDrawElement --enable-experimental-web-platform-features
```

(or `chrome://flags/#canvas-draw-element` + `#enable-experimental-web-platform-features`). Without it the page shows a notice naming the missing APIs instead of a blank canvas.

```bash
pnpm -F @full-stack-ds/react build && pnpm -F @full-stack-ds/vue build && pnpm -F @full-stack-ds/lit build
pnpm -F @full-stack-ds/example-spatial-console-web dev             # http://localhost:5188/
pnpm -F @full-stack-ds/example-spatial-console-web test            # projection math vs three.js
pnpm -F @full-stack-ds/example-spatial-console-web verify:runtime  # real Chrome, trusted clicks
```

Drag empty canvas to orbit; wheel to zoom; click the object or the lamp bulb to pick it.

## Layout

```
web/src/
  store.ts            framework-neutral scene state
  projection.ts       element px -> canvas px 4x4 for a mesh (pure; unit-tested)
  html-in-canvas.ts   the only module that knows the API's shapes (DrawableSurface)
  scene.ts            three.js scene, orbit, raycast picking, paint loop
  panels/             one mount function per framework
web/e2e/verify-runtime.mjs   runtime verifier (see Evidence)
```

## Evidence

- `projection.test.ts` checks the element→canvas matrix against three.js's own `Vector3.project` at all four corners and at an interior point. The interior-point check guards against an affine approximation, which can't reproduce perspective. It also checks the front-facing test, including a panel behind the camera.
- `e2e/verify-runtime.mjs` launches flagged Chrome and uses trusted mouse input only. It orbits the camera to an oblique view with a real drag, then clicks each control at the screen point its mesh projects it to. Each click is followed by an assertion on the scene-side effect: light intensity, light colour, geometry swap, rotation halted, selection cleared. It also runs a **negative control**: a click at a control's unprojected layout position must not toggle it. Scene→UI checks cover the Lit readout text and the re-upload count, plus the React Switch state after the 3D bulb is clicked. The unflagged path is checked for its notice. Screenshots and `report.json` are written to `test-results/spatial-console/`.

## Findings

1. **The API is in motion; the shim absorbs it.** The explainer (Sept 2026) uses `content="drawable"`, `texElementSubImage2D` and `canvas.updateElementGeometry({ canvasTransform })`. Chrome 153's flag instead exposes `layoutsubtree`, `texElementImage2D(target, internalformat, element)`, and CSS-transform hit testing, with no `updateElementGeometry`. `html-in-canvas.ts` detects which one is present. Only the older path has been run here; the explainer path is written against the IDL and **has not been executed**.
2. **On the older path a drawable's own CSS transform is baked into its snapshot.** Probed: `translate(10px,5px)` shifts the content 10px inside the texture, and a projected `matrix3d` pushes it out entirely, so the upload is transparent. A transform on a non-drawable **ancestor** leaves the snapshot byte-identical and still moves hit testing. Each panel therefore sits in a `.panel-mount` wrapper that carries the projected transform.
3. **On the older path `changedElements` names the canvas's direct child, not the drawable descendant.** It also names the mount when the mount's transform changes, so panels re-upload every frame while the camera moves.
4. **`backface-visibility` can't be used for culling.** The projected matrix's z row holds clip depth, not surface orientation. Panels facing away are marked `inert` from a projected-winding test instead.
5. **Package finding (outside this lane's scope): the generated Vue components drop a template-passed `data-testid`.** Seen on `ToggleSwitch` and `Button`: the rendered element has no `data-testid` attribute, while `aria-label` passes through. The Vue unit tests pass `data-testid` via `attrs` but never assert that it lands. The verifier selects the Vue switch by `role` for now.

## Non-claims

- **No occlusion-aware input.** Hit testing follows DOM order, not 3D depth. A panel drawn behind another panel or behind the object can still take the click if it's later in the DOM.
- **One Chromium build, one scene layout.** No other engine, no Canary, no explainer-path execution.
- **No visual-quality or text-legibility claim at grazing angles.** Textures are 1× element pixels with linear filtering and no mipmaps.
- **No accessibility claim.** The panels are in the accessibility tree, but on the older path they carry no geometry information for assistive tech. Keyboard focus into drawn panels has not been checked.
- **Not a rail member and not in CI.** The runtime verifier needs a flagged local Chrome and a running dev server.
