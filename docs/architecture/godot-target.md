---
doc_id: ARCH-GODOT-TARGET-001
authority: implementation
status: active
title: Godot comparative pilot
---

# Godot comparative pilot

`GODOT-COMPARATIVE-PILOT-01` adds an explicit Godot target and compares it with Unity using the frozen [semantic traces](../../packages/ds-godot/fixtures/traces.json). See [package instructions and limits](../../packages/ds-godot/README.md).

The lowering path is contract → ComponentIR → GDScript/PackedScene/Theme resources → shared Godot Control runtime. Dispatch uses value model, interaction operation and surface attachment, not component identity. The generated controls carry operation and declared defaults; only the bounded behavior named in the capability receipt is realized. Unsupported shapes and unknown props reject emission; known excluded props remain named rather than receiving support credit.

The initial common observations cover uncontrolled/disabled boolean state, controlled request versus commitment, collapsible single selection, disabled tab selection and surface toggling. Godot's native CheckButton and scene tree replace Unity UI Toolkit's button/visual tree. The surface uses a CanvasLayer within the viewport. This is a substrate choice, not a change to the shared state trace.

The test fixture saves/reopens a serialized scene through editor APIs, checks token fallback propagation, executes graphics-backed observations and exports a fresh macOS application. The comparison runs Unity Editor-panel traces against Godot runtime/export traces. It requires matching run IDs and exact expected sequences. It does not claim input-device integration, accessibility, arbitrary composition, full visual parity or shared traces executed in a Unity Player.

The foreground Theme projection is intentionally narrow; other styling remains unsupported and explicit. The changed-token probe establishes a consumed value rather than treating an emitted dictionary as rendering proof. Expanding component admission should follow enforced capability decisions and independent consumer workflows, not the number of scenes that compile.

At source `62f37334`, comparison run `5af9bd21-83b8-4e79-ad7c-6fa825ccc9a2` passed the frozen cases against Unity 6000.5.3f1 and Godot 4.7.2. The Godot macOS export used the matching export template, Compatibility rendering, and ETC2/ASTC texture import. Run evidence includes `comparison.json`, per-engine receipts, editor serialization logs and an exported screenshot. Source trees and the trace file are hashed in the comparison receipt. The default `standalone` feature-name assumption was rejected during harness development; the exported witness uses Godot's `template` feature tag.
