---
doc_id: ARCH-UNITY-TARGET-001
authority: implementation
status: active
title: Unity UI Toolkit pilot
---

# Unity UI Toolkit pilot

`UNITY-INTERACTIVE-COMPONENTS-01` adds a registered Unity generation target with a bounded component allowlist and a local UPM package. Read [the package README](../../packages/ds-unity/README.md) for installation, supported behavior, commands and limitations.

The lowering path is `ComponentIR → Unity emitter → C# UXML controls → shared UI Toolkit runtime`. Boolean form-control facts select the boolean primitive; interaction operations select item-group behavior; part-attached, non-blocking, click-open surfaces select the anchored-surface primitive. Unsupported shapes throw. No dispatch rule branches on component identity. Auxiliary item controls are generated beside their parent; trigger and content nodes are composed by the shared runtime.

The wrappers carry normalized channel names, supported prop defaults, anatomy bindings, dismissal policy and typed default-size geometry. The shared runtime owns Unity event delivery, retained element trees, focus and panel coordinates. It does not read JSON contracts at runtime. The adapter maps the currently shared `type`, `collapsible`, `orientation`, `activationMode`, `loop`, `appearance` and `unmountInactive` prop vocabulary to C# options only when those props are declared. This is a bounded adapter, not proof that arbitrary future interaction options can be derived.

Verification has separate boundaries: TypeScript tests check routing and contract influence; compiler-only checks use real Unity reference assemblies and the UXML generator; EditMode tests require an activated Unity Editor and exercise import plus live panel events. The existing `governed:rail` does not execute the Unity lane. Neither compilation nor narrow EditMode facts establish full styling, accessibility or player runtime parity.

Unity's [custom-control documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-create-custom-controls.html) defines the partial-class / `UxmlElement` registration mechanism. Unity's [package layout documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/cus-layout.html) defines Runtime, Editor, Tests and Samples packaging.

## Recorded pilot verification

At source commit `c3b29662`, Unity 6000.5.3f1 ran `node scripts/unity-tests.mjs` with graphics enabled: all 14 EditMode cases passed, with no skipped cases. The runner imported the package as an embedded UPM package and imported its UXML/runtime sample into a consuming project's Assets directory. The UXML witness constructs the generated controls, discovers compound items, activates a tab and opens the popover. Other cases exercise boolean state, controlled requests, accordion single/multiple selection, keyboard tab navigation, panel retention, anchored dismissal and geometry.

The initial graphics-disabled run failed during panel setup; it supplied no behavior evidence. The first graphics-enabled run exposed a test-policy overlap: outside pointer focus changes also trigger blur. The final pointer case disables blur to isolate the outside-pointer policy; a separate real-focus case verifies blur across the anchor/content boundary.

The local evidence files are `tmp/unity-pilot/results.xml` and `tmp/unity-pilot/editor.log`, reproduced by the command above. They are not committed build artifacts. The existing root/framework suites and admission rail also passed during the slice; those checks do not extend Unity's narrow runtime claim. Player builds, screen-reader behavior and full visual parity remain outside this pilot.

## Runtime styling follow-up

`UNITY-RUNTIME-STYLING-01` addresses the Editor-default inheritance exposed by the consuming RC project: low-contrast Player text, partial native button styling, crowded disclosure labels and an unthemed portaled popover. The shared runtime now attaches a package-owned USS resource to controls and floating content. This leaves contract lowering unchanged and keeps consumer panel scaling outside package authority.

`StylingTests.cs` checks Editor typography, switch/disclosure spacing and focus, then enters Play mode to render Player panels at 640×800 and 320×600 with Constant Pixel Size. It checks selected/disabled states, floating text/button styles, viewport containment and reachable scrolling. The runner writes screenshot witnesses beside its logs. These bounded checks do not establish arbitrary-resolution visual parity or player-build admission. The USS palette remains Unity-specific; full design-token and brand projection is future work.

## Capability inventory and standalone boundary

`UNITY-CAPABILITY-PLAYER-01` introduces reproducible source accounting:

```sh
pnpm --filter @full-stack-ds/codegen build
node packages/ds-codegen/dist/frameworks/unity/capabilities.js > tmp/unity-capabilities.json
node scripts/unity-player.mjs
```

The inventory walks the authoritative contract loader and registry. Each component receives a lowering disposition; each normalized prop is classified as `emitted-api` or `not-emitted`. Every contract and token/style sidecar leaf remains individually visible as `unassessed`. Contract/sidecar hashes bind the observations to their inputs. This is an inventory of obligations, not a capability-admission gate or proof of semantic parity. `not-emitted` means no matching generated C# property: callbacks can have shared-runtime C# adaptations, and default channels can have imperative initialization equivalents, but those require explicit adjudication rather than automatic support credit.

The first inventory finds only the existing allowlist admitted. Checkbox and ToggleSwitch pass the current shape dispatcher but remain unadmitted candidates; that does not establish their intended anatomy or behavior. Most other corpus shapes are rejected. The pilot still omits generated APIs for default channels and callback props, Switch size/form fields, and Tabs idBase. DOM-only fields need a reasoned platform disposition; behavior and visual omissions need implementation or an explicit release exclusion. Unknown future props appear as `not-emitted`; ordinary generation is not yet changed to reject them.

The standalone witness copies the package into a fresh consuming project, creates a scene and PanelSettings, builds a macOS app, launches its executable with graphics, and requires an exact run identity and ordered check set. It records source hashes, logs, JSON and a screenshot under `tmp/unity-player/<run-id>/`. Tests prove package resources, generated UXML types, selected state changes, single callback delivery and popover placement/dismissal in an actual OSXPlayer process. UI events are synthetic. It does not prove physical keyboard/controller input routing, accessibility, UI Builder save/reopen, minimum-version compatibility, other operating systems or IL2CPP. The fixture runs in the background so an unattended window cannot stall the measurement.

At source `18abc116`, fresh run `9e7113e5-da40-4802-9e9b-8b8c0df36f90` passed all 11 required standalone checks; the optional Editor lane also passed all 17 cases. Recorded environment: Unity 6000.5.3f1, macOS, Metal, standalone Player. The package's declared 6000.0 minimum remains unverified; do not interpret this newer-version witness as minimum-version admission. The first background-disabled launch produced no usable receipt. A subsequent default-template project passed, but the stricter minimal project exposed an undeclared Test Framework dependency: package Editor tests were compiling without NUnit. The test assembly now uses a package-version define constraint, so consumers without the Test Framework do not compile the optional tests; the explicit Editor test lane still exercises them. The minimal manifest declares only UIElements plus screenshot/image-conversion modules needed by the witness.

Next dependencies, in order:

1. Adjudicate the exposed prop/semantic gaps into a machine-readable support boundary and make unsupported new facts reject generation. Preserve C# channel adaptation explicitly rather than treating public property names as semantic equivalence.
2. Verify actual input routing, accessibility feasibility, UI Builder round trips and the minimum Unity version before widening platform promises.
3. Project consumed token/style/icon facts into Unity, with explicit unsupported-property diagnostics and floating theme propagation.
4. Compose an independent settings/inventory workflow to select the next component families, then add build/runtime admission to CI. The current standalone fixture still consumes the package sample, so it is not that independent application acceptance test.
