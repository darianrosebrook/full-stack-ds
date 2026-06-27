# @full-stack-ds/iconography

Governed icon contracts and projection emitters for Full Stack DS.

This package is the source surface for symbolic icon leaves such as
`fsds.icon.placeholder`. Component contracts and usage-style composition trees
should reference those leaves by stable name and size. Target emitters decide
how the icon becomes a framework-native import, SVG symbol, Android vector,
React Native component, Swift resource, Kotlin resource, or Figma vector.

## Authority Model

- Source contracts live in `icons/<Name>/<Name>.icon.json`.
- Size variants are first-class authored glyphs, not scaled render requests.
- Vector path data is the governed payload.
- Platform names and target projections are derived from the contract.
- Generated output under `generated/` is scratch and must not be committed.

## Commands

```bash
pnpm --filter @full-stack-ds/iconography run validate
pnpm --filter @full-stack-ds/iconography run build
```

The build emits:

- `generated/catalog.json`
- `generated/web/sprite.svg`
- `generated/web/icons/*.svg`
- `generated/react/*.tsx`
- `generated/svelte/*.svelte`
- `generated/react-native/*.tsx`
- `generated/android/drawable/*.xml`
- `generated/android/residuals.json`
- `generated/swift/*.swift`
- `generated/kotlin/*.kt`

