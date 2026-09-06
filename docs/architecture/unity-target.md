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
