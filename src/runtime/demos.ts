import type { ComponentBundle, Framework } from "../types/data";

interface DemoProps {
  [key: string]: unknown;
}

/**
 * Builds the in-iframe demo harness for a given framework + component +
 * (optional) prop override map. Output is a string of TS / Vue / Svelte /
 * Angular / Lit code suitable for splicing into the framework's shell.
 *
 * The harness is intentionally tiny: it renders the component once with a few
 * default props. Variants matrix passes prop overrides to render specific
 * combinations.
 */

function defaultPropsFromContract(component: ComponentBundle): DemoProps {
  const props: DemoProps = {};
  const variants = component.contract.variants ?? {};
  for (const [k, vals] of Object.entries(variants)) {
    if (Array.isArray(vals) && vals.length > 0) props[k] = vals[0];
  }
  const members = component.contract.props?.styled?.members ?? [];
  for (const m of members) {
    if (m.default !== undefined && !(m.name in props)) props[m.name] = m.default;
  }
  return props;
}

function renderJsxProps(props: DemoProps): string {
  return Object.entries(props)
    .map(([k, v]) => {
      if (typeof v === "string") return ` ${k}="${escape(v)}"`;
      if (typeof v === "boolean") return v ? ` ${k}` : "";
      if (v === null || v === undefined) return "";
      return ` ${k}={${JSON.stringify(v)}}`;
    })
    .join("");
}

function renderHtmlAttrs(props: DemoProps): string {
  return Object.entries(props)
    .map(([k, v]) => {
      if (typeof v === "boolean") return v ? ` ${k}` : "";
      if (v === null || v === undefined) return "";
      return ` ${k}="${escape(String(v))}"`;
    })
    .join("");
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Components whose demo node should render with no inner text — typically
// because the visual is purely graphic (icon, avatar) or purely structural
// (divider, aspect ratio, page transition). Editing this list is the cheapest
// way to fix a noisy demo without touching the contract.
const NO_CHILD_LABEL = new Set<string>([
  "AspectRatio",
  "Avatar",
  "BrandSwitcher",
  "Divider",
  "Icon",
  "Image",
  "PageTransition",
  "Postcard",
  "Progress",
  "Skeleton",
  "SlinkyCursor",
  "Spinner",
  "Status",
  "VisuallyHidden",
]);

function childLabel(component: ComponentBundle): string {
  return NO_CHILD_LABEL.has(component.name) ? "" : component.name;
}

function elementTag(component: ComponentBundle, fw: Framework): string {
  if (fw === "lit" || fw === "angular") {
    return `fsds-${component.name.toLowerCase()}`;
  }
  return component.name;
}

export function buildReactDemo(
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  const props = { ...defaultPropsFromContract(component), ...(overrideProps ?? {}) };
  const tag = component.name;
  const child = childLabel(component);
  const propsStr = renderJsxProps(props);
  const node = child
    ? `<${tag}${propsStr}>${escape(child)}</${tag}>`
    : `<${tag}${propsStr} />`;
  return `import { createRoot } from "react-dom/client";
import { ${tag} } from "./${tag}";

const root = createRoot(document.getElementById("root"));
root.render(${node});
`;
}

export function buildVueDemo(
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  const props = { ...defaultPropsFromContract(component), ...(overrideProps ?? {}) };
  const tag = component.name;
  const child = childLabel(component);
  const attrs = Object.entries(props)
    .map(([k, v]) => {
      if (typeof v === "boolean") return v ? ` ${k}` : "";
      if (typeof v === "string") return ` ${k}="${escape(v)}"`;
      return "";
    })
    .join("");
  const node = child
    ? `<${tag}${attrs}>${escape(child)}</${tag}>`
    : `<${tag}${attrs} />`;
  return `<script setup lang="ts">
import ${tag} from "./${tag}.vue";
</script>

<template>
  ${node}
</template>
`;
}

export function buildSvelteDemo(
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  const props = { ...defaultPropsFromContract(component), ...(overrideProps ?? {}) };
  const tag = component.name;
  const child = childLabel(component);
  const attrs = Object.entries(props)
    .map(([k, v]) => {
      if (typeof v === "boolean") return v ? ` ${k}` : "";
      if (typeof v === "string") return ` ${k}="${escape(v)}"`;
      return "";
    })
    .join("");
  const node = child
    ? `<${tag}${attrs}>${escape(child)}</${tag}>`
    : `<${tag}${attrs} />`;
  return `<script lang="ts">
  import ${tag} from "./${tag}.svelte";
</script>

${node}
`;
}

export function buildLitDemo(
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  const props = { ...defaultPropsFromContract(component), ...(overrideProps ?? {}) };
  const tag = elementTag(component, "lit");
  const child = childLabel(component);
  const attrs = renderHtmlAttrs(props);
  return child
    ? `<${tag}${attrs}>${escape(child)}</${tag}>`
    : `<${tag}${attrs}></${tag}>`;
}

export function buildAngularDemo(
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  const props = { ...defaultPropsFromContract(component), ...(overrideProps ?? {}) };
  const tag = elementTag(component, "angular");
  const child = childLabel(component);
  const attrs = renderHtmlAttrs(props);
  return child
    ? `<${tag}${attrs}>${escape(child)}</${tag}>`
    : `<${tag}${attrs}></${tag}>`;
}

export function buildDemo(
  framework: Framework,
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  switch (framework) {
    case "react":
      return buildReactDemo(component, overrideProps);
    case "vue":
      return buildVueDemo(component, overrideProps);
    case "svelte":
      return buildSvelteDemo(component, overrideProps);
    case "lit":
      return buildLitDemo(component, overrideProps);
    case "angular":
      return buildAngularDemo(component, overrideProps);
  }
}
