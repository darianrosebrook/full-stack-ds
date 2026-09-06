# Godot comparative pilot

Copy `addons/full_stack_ds` into a Godot 4.7.2 project. The generated `DSSwitch`, `DSAccordion`, `DSPopover` and `DSTabs` script classes and their `.tscn` scenes are editor-importable. No editor plugin must be enabled. The generated resources depend on the shared `runtime/control.gd` in the same add-on path.

This is a comparative semantic pilot, not full component parity. `value` is a normalized string channel, `controlled` prevents speculative state commitment, and `value_requested`/`value_changed` expose requests and accepted state. Boolean channels use `"true"` and `"false"`. Use `add_item(key, label, body, disabled)` after attachment for compound content. Add arbitrary content to a Popover's `content` after attachment. The surface is an in-viewport CanvasLayer overlay, not an operating-system window.

## Generate and verify

From the repository root:

```sh
pnpm --filter @full-stack-ds/codegen build
node packages/ds-codegen/dist/cli.js --target=godot
node scripts/godot-pilot.mjs
node scripts/engine-comparison.mjs
```

The Godot lane uses a fresh consumer project, imports resources, saves and reloads a serialized Switch in separate editor processes, runs graphics-backed traces, and exports/launches a macOS debug application. Install matching macOS export templates first. `GODOT` selects the binary; the default is `/Applications/Godot.app/Contents/MacOS/Godot`. The comparison also requires an activated Unity installation (`UNITY_EDITOR` override). Evidence stays under `tmp/`; no imported cache or downloaded engine assets belong in Git.

`fixtures/traces.json` was committed before implementation. Both engines consume it; the comparator requires the same run identity and ordered expected states. Unity executes these particular traces in an Editor panel; Godot executes them in an editor runtime and exported application. This comparison does not establish physical input integration or identical rendering. Unity's separate standalone lane is independent evidence, not execution of these shared traces in a Unity Player.

## Explicit limits

The generated `capabilities.json` beside each component names known excluded props. New unknown props and unsupported interaction/surface shapes reject generation. Known exclusions are not silently counted as implemented: multiple selection, variants, configurable focus/navigation, unmounting, placement/dismissal options, default-channel props and DOM form/ID fields are outside the traced behavior. Initial state can be set through `value`; callbacks adapt to signals. These adaptations do not establish full prop parity.

Theme resources project an unconditional authored foreground fallback through normalized token/CSS facts. A changed-token probe must resolve to `#123456` in the engine. Engine-specific base styling supplies remaining presentation. This is not resolved brand projection, complete component styling, motion, iconography, accessibility or arbitrary viewport support. Scene serialization is tested through Godot's editor APIs, not a manual Inspector workflow.
