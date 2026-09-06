---
title: Retokening page attempts
updated: 2026-09-06
---

# Spotify and Pinterest as consumer probes

These are bounded Web DOM attempts, using real generated React components,
original SVG artwork, and deterministic sample content. They test whether the
existing controls can carry substantially different visual identities. They do
not implement streaming, recommendations, an authenticated Pinterest account,
or pixel-identical copies of third-party pages.

## Materials and reference scope

| Material | Available source | Use |
|---|---|---|
| Spotify desktop reference | [Official June 2023 redesign](https://newsroom.spotify.com/2023-06-20/spotify-desktop-experience-redesign-your-library-now-playing-views-customize/) and its [published image](https://storage.googleapis.com/pr-newsroom-wp/1/2023/06/FTR-Header-v.2-x2-1920x733.jpg) | Library, discovery, now-playing panels and persistent playback strip. A fixed dated reference, not a claim about today's account UI. |
| Pinterest feed semantics | [Home feed help](https://help.pinterest.com/en/article/explore-the-home-feed), [public discovery](https://www.pinterest.com/ideas), [official Masonry source](https://github.com/pinterest/gestalt/blob/master/packages/gestalt/src/Masonry.tsx) and its [visual fixture](https://raw.githubusercontent.com/pinterest/gestalt/master/playwright/visual-test/Masonry.spec.ts-snapshots/Masonry-chromium-darwin.png) | Image-led discovery, variable-height columns, search and saved ideas. Public pages inspected September 6, 2026; no personalized feed accessed. |
| Existing brand | [Streaming tokens](../../../packages/ds-tokens/src/brands/streaming.tokens.json) | Existing semantic palette/shape/density vocabulary; the attempts independently scope exact component overrides to test those controls. |
| Components | [Contract corpus](../../../packages/ds-contracts/components/) | Card/media/content, Image, Button, Input, Text, Progress and Icon, composed with Stack. |
| Icons | [Owned icon catalog](../../../packages/ds-iconography/icons/) | Home, search, navigation arrows, panels and overflow. Use canonical kebab-case names. No play/pause/volume glyphs in the inspected catalog; text labels carry the bounded controls. |
| Artwork | [Original deterministic studies](../../../e2e/fixtures/retoken-pages/artwork.ts) | Local data-URI SVGs. No network images, proprietary fonts, logos or copied media committed. |

## Requirements minus available controls

| Required decision | Existing control | Initial disposition |
|---|---|---|
| Dark/white surfaces, primary/secondary text, green/red actions | Component background/foreground bindings with semantic/literal fallbacks | Available; exercised in both attempts. |
| Flat cards, independent media corners, pill buttons and search | Card border/shadow/radius/media slots; Button/Input radius | Available; independently overridden without component internals. |
| Type sizes/weights and compact spacing | Text props and typography slots, component spacing, shared box controls | Available. System font is inherited from the page; no proprietary font fidelity claimed. |
| Small fixed thumbnails | Image width/height props | **Defect:** attributes are emitted, but generated root `width:auto;height:auto` overrides their presentational hints. Intrinsic 600×800 art blows up the library/player. |
| Square album art and mixed-ratio Pins | Image `aspectRatio` presets | **Defect:** prop is declared and destructured but never realized. Computed ratio remains `auto`. |
| Cover cropping and focal position | Image `objectFit` / `objectPosition` props | **Defect:** props are dropped. Computed fit remains `fill`, position `50% 50%`. |
| Multi-panel shell, responsive breakpoints, background gradient | Consumer composition | Authored on page containers. No reason to add an arbitrary gradient or panel-layout token merely for these pages. |
| Variable-height feed | Consumer CSS columns | Bounded layout, with sequential column reading order. No shortest-column placement, infinite loading, virtualization or scroll anchoring claim. |
| Save affordance, keyboard access and search | Button/Input semantics plus consumer state | Exercised by browser tests. Overlay placement/reveal is consumer composition. |
| Seeking/volume | No Slider contract in inspected corpus | Progress is a read-only indicator. Full playback controls would need a separately justified interaction component; they are not a color/token defect. |
| Exact branded motion | Card's fixed hover translation, duration/easing slots | Unexercised: these cards do not use `interactive`. No claim that every motion characteristic is retokenable. |
| Broken-image recovery | Image declares fallback/placeholder props | Not exercised by deterministic valid assets; the attempt does not establish their behavior. |

## Run and inspect

Run `pnpm run tokens:build`, then `pnpm run dev`. Open
`/e2e/fixtures/retoken-pages/index.html?page=spotify` or `?page=pinterest`.
The source is [pages.tsx](../../../e2e/fixtures/retoken-pages/pages.tsx),
with [theme.css](../../../e2e/fixtures/retoken-pages/theme.css) separating page
geometry from component controls. There are no appearance declarations that
reach into generated component parts. The page's system font, backgrounds,
container spacing, columns and overlay positioning belong to composition.

Run `FSDS_E2E_PORT=5198 pnpm exec playwright test e2e/retoken-pages.spec.ts --workers=2`.
The suite writes desktop/narrow screenshots and `media-facts.json` under
`test-results/`, checks search/save/play-selection behavior and horizontal
overflow, and verifies representative component overrides. Its initial green
interaction result did **not** prove media sizing: manual image review and
computed geometry exposed the failures above. Preserve that distinction when
reading a passing result.

The initial failures justify an Image contract/style repair through the existing
DOM realization mechanisms. They do not justify changing semantic dependency
direction or inventing a second styling runtime. Follow-up acceptance must assert
actual image dimensions, cropping, preset ratios, override precedence and clearing
across Web DOM targets, then re-render these same pages.
