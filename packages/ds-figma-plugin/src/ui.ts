import { mount } from "svelte";
import FigmaPluginApp from "./FigmaPluginApp.svelte";
import "./ui.css";

// `@full-stack-ds/svelte`'s package.json `exports` map only resolves to
// `dist/*` (built via `svelte-package`), and that `dist/` is not committed
// (gitignored build output, out of this port's scope to build). Importing
// the package form here would break the figma-plugin build until someone
// runs `pnpm -F @full-stack-ds/svelte build` first. `vite.config.ts`'s `ui`
// mode aliases `@full-stack-ds/svelte` to `../ds-svelte/src/index.ts` for
// this reason; the relative paths below resolve the same source files
// without depending on that alias for CSS (Vite doesn't apply resolve
// aliases inside plain `.css` `@import`/asset URLs the same way it does for
// JS/TS specifiers, so the tokens + component CSS are pulled in directly).
import "../../ds-tokens/generated/tokens.css";
import "../../ds-svelte/src/components/Badge/Badge.tokens.css";
import "../../ds-svelte/src/components/Badge/Badge.css";
import "../../ds-svelte/src/components/Button/Button.tokens.css";
import "../../ds-svelte/src/components/Button/Button.css";
import "../../ds-svelte/src/components/Card/Card.tokens.css";
import "../../ds-svelte/src/components/Card/Card.css";
import "../../ds-svelte/src/components/Progress/Progress.tokens.css";
import "../../ds-svelte/src/components/Progress/Progress.css";
import "../../ds-svelte/src/components/Table/Table.tokens.css";
import "../../ds-svelte/src/components/Table/Table.css";
import "../../ds-svelte/src/components/Tabs/Tabs.tokens.css";
import "../../ds-svelte/src/components/Tabs/Tabs.css";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Missing #app root.");
}

mount(FigmaPluginApp, { target });
