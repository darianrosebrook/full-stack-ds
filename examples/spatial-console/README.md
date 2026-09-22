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
6. **Package finding (outside this lane's scope): the React and Vue `CardHeader`s are exposed as `banner` landmarks.** Two cards give two page-level banners. Lit's header sits in shadow DOM and is not exposed as a banner.
7. **Theme and density come with the tokens.** Under dark mode the panels render the dark theme from token CSS alone, with no lane code for it, and text stays sharp at DPR 2.
8. **Package finding (outside this lane's scope): the React `Sheet` ignores `modal`.** `Sheet` destructures `modal` (default `true`) but never reads it. `useSheet` always traps focus, locks scrolling and dismisses on outside click, and the panel always renders `aria-modal="true"`. So `modal={false}` is a no-op, and a non-modal bottom panel, such as a keyboard that must leave focus in a text field, can't be built on it. Seen in `packages/ds-react/src/components/Sheet/`; the other frameworks were not checked.
9. **Package finding (outside this lane's scope): the React `Toast` drops its `action` prop.** When `action` is set, `Toast` renders an empty `<div className="toast__action" />` and never places the `action` node in it. Read from `packages/ds-react/src/components/Toast/Toast.tsx`, not exercised at runtime; the other frameworks were not checked.
10. **Package finding (outside this lane's scope): the React `Toast` mixes live-region signals.** The root is `role="alert"`, which implies assertive, yet it also carries `aria-live={politeness}`, with polite as the default. The item inside is `role="status"`. The root renders even while no toast is open. A screen reader may announce every toast assertively whatever `politeness` says. Read from source; not checked with a screen reader.
11. **Token finding (outside this lane's scope): primary and destructive buttons render the same red in the default brand.** "Send to editor" (primary) and "Delete everything" (destructive) are indistinguishable in both themes, and the focus ring is the same red. The default brand aliases the primary colour to the danger palette's red. Seen in the desk screenshots.

## Non-claims

- **No occlusion-aware input.** Hit testing follows DOM order, not 3D depth. A panel drawn behind another panel or behind the object can still take the click if it's later in the DOM.
- **One Chromium build, one scene layout.** No other engine, no Canary, no explainer-path execution.
- **No visual-quality or text-legibility claim at grazing angles.** Textures are 1× element pixels with linear filtering and no mipmaps.
- **Accessibility is only partly covered.** A DevTools MCP review (flagged Chrome, DPR 2, dark mode) found every control in all three panels in the accessibility tree with the correct role, name and state. Tab reaches the drawn React switch and Space toggles the lamp. Not established: whether a focus indicator appears in the drawn texture (none was visible on the focused switch), screen-reader geometry on the older path, and focus order across panels.
- **Not a rail member and not in CI.** The runtime verifier needs a flagged local Chrome and a running dev server.

## Typing cat (`web/cat.html`)

A second page on the same shim: the typing-cat meme seen over the cat's shoulder. A laptop, tablet and phone on a desk each show one live React site built from public `@full-stack-ds/react` exports. The cat is a puppet for **your** input and never types on its own.

- **Three devices, one site.** Each screen is a same-origin `<iframe>` drawable at the device's CSS width (1152, 768, 390; the laptop's 1152×720 is a slightly zoomed desktop, still above the 1023px breakpoint), so the site's media queries see a real viewport: the laptop gets the desktop layout, the tablet the tablet layout, the phone the mobile layout. The DS ships no responsive layout, so the three layouts are app-layer CSS in `src/cat/site/site.css`. The frames share one store (`src/cat/site-store.ts`, published on the parent window before the frames load), so what you type shows on all three screens.
- **Each paw slaps its half of the keyboard.** The split is by `KeyboardEvent.code` (`src/cat/keyboard-layout.ts`, unit-tested): the first five character keys of each row (1–5, Q–T, A–G, Z–B) and the modifiers to their left go to the left paw. Everything else goes to the right paw, and Space takes both. `code` keeps the split on the physical key under any keyboard layout.
- **The right paw rides the trackpad across the laptop's viewport.** The pointer's window position is mapped back through the laptop screen's projection (an inverted plane homography, `src/cat/trackpad.ts`, unit-tested) into laptop-viewport pixels. That fraction of the viewport is where the paw sits on the pad. A pointer off the laptop screen pins the paw to the nearest edge of the pad. Clicks tap, and a right-side key takes the paw back to the keys.
- **The cat leans over to use the tablet and the phone.** The mouse is only ever over one screen, and keys go only to the focused frame, so the device the latest event came through is the one the cat attends to. Key and pointer events inside a frame never reach the parent, so the desk listens in every frame and knows which one spoke. On the tablet (the cat's left) the cat slides and turns left, and its left paw follows the pointer on the tablet's screen and taps on click. On the phone (its right) the right paw does the same. Typing there taps the matching key on the device's on-screen keyboard, and no laptop key is slapped. A key that keyboard lacks (a digit, a modifier) is tapped along the focused field instead. Over the laptop or bare desk the cat sits upright again. The shoulders are in the cat's frame and sit inside a chest mass, so the arms reach from wherever the lean put them and their shoulder ends stay buried.
- **The tablet and phone have an on-screen keyboard.** The desk loads each frame with `?device=`. On the tablet and phone the site mounts `DeviceKeyboard` (`src/cat/site/DeviceKeyboard.tsx`), which slides up from the bottom while a text field has focus and away when it blurs. Its keys never take focus (pointerdown is cancelled), so the field keeps it. Clicking a drawn key types into the focused field the way a keypress would, and a hardware key flashes its on-screen twin. It is app-layer, built from DS tokens, because the DS `Sheet` can't host it (finding 8).
- **Screens are real input surfaces.** A click where a screen draws a control lands on that control, as on the spatial console.
- **Each device browses on its own.** The nav's Draft, Stats and Treats links route on each frame's own hash (`#/stats`), so each device can show a different page. The shared store carries only the site's data, not the page. Draft is the writing page. Stats shows counters, the word goal and a recent-activity list. Treats is a product grid long enough to scroll on every device.
- **The avatar opens an account menu** (DS `Popover`). It holds links to Stats and the treat shop, a nap toggle that flips the nav badge, and a "Sign out" that cats can't actually do.
- **Actions toast everywhere** (DS `Toast`). Sending to the editor, ordering a treat, deleting the draft and signing out each publish an event through the shared store (`store.emit`). Every device shows it as a toast, keyed by event id so a repeat is a fresh toast. Toasts don't use `Toast`'s `action` prop, because it is dropped (finding 9).
- **The mouse wheel scrolls the device under the pointer.** Wheel events over a drawn screen reach that frame through the browser's own hit testing and scroll it natively, and the new scroll position is re-uploaded. The paw mimes it: a stroke up the laptop's trackpad, a swipe up the tablet's or phone's screen.

`e2e/verify-cat.mjs` (`pnpm -F @full-stack-ds/example-spatial-console-web verify:cat`, needs the dev server running) uses trusted input only. It checks:

- **Layouts:** each frame's computed style matches the layout expected for its device.
- **Paw split:** both sides of the split in every row (1/5/6/0, Q/T/Y/P, A/G/H/L, Z/B/N/M) are slapped by the expected paw, and that paw lands on the key.
- **Typing:** the typed text reads back from all three screens.
- **Space:** it is slapped by both paws.
- **Trackpad:** at four points on the laptop screen, the paw's trackpad position equals the pointer's place in the laptop viewport. A point on bare desk up and left of the laptop pins it to the pad's top-left corner.
- **Clicks:** clicking where the tablet draws "Order treats" opens its treat shop, and "Order" on a product there orders one that the phone counts.
- **Pages, menu, toasts, scrolling:**
  - The avatar opens the account menu below it. "Your stats" opens Stats on that device only, where recent activity lists the order.
  - Ordering, sending, deleting and signing out each show the matching toast on all three devices.
  - The wheel over the laptop's and the phone's treat shop scrolls each by 500 px, with a fresh upload. Meanwhile the paw is displaced up the trackpad or up the phone's screen.
- **Leaning:** over the tablet the cat leans fully left and the left paw sits at the pointer's point on that screen; the phone is the mirror image with the right paw. Clicking the draft field there taps it with that paw and focuses it in that frame. Focusing it docks that device's keyboard fully on-screen, while the other handheld's stays hidden and the laptop has none. Each typed key is tapped inside its on-screen key's box, lands in the shared draft (read back from the laptop too) and leaves the last laptop slap untouched. Clicking a drawn key types it and keeps the field focused. Tapping the page away from the field blurs it and the keyboard slides off-screen. Back over the laptop, the lean returns to zero with the left paw on the keys and the right on the trackpad.
- **Framing:** the tablet is left, the phone right, and the paws below the laptop screen.

Screenshots and `report.json` go to `test-results/typing-cat/`.

Non-claims beyond the spatial console's:

- Paw pose is checked by position, not by how it looks.
- The framing check is a coarse layout assertion. Whether the scene reads like the reference photo is a judgment from the screenshots.
- The tablet and phone text is small at this camera distance.
