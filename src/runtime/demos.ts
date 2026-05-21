import type { ComponentBundle, Framework } from "../types/data";

export interface DemoProps {
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

export function defaultPropsFromContract(component: ComponentBundle): DemoProps {
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
  "Avatar",
  "Divider",
  "Icon",
  "Image",
  "Postcard",
  "Progress",
  "Skeleton",
  "Spinner",
  "Status",
]);

export function childLabel(component: ComponentBundle): string {
  return NO_CHILD_LABEL.has(component.name) ? "" : component.name;
}

export function elementTag(component: ComponentBundle, fw: Framework): string {
  if (fw === "lit") {
    return `fsds-${component.name.toLowerCase()}`;
  }
  if (fw === "angular") {
    // Angular emitters use kebab-case selectors (e.g. fsds-profile-flag, not
    // fsds-profileflag). Lowercasing alone collapses internal word boundaries
    // and produces selectors that don't match the components.
    return `fsds-${pascalToKebab(component.name)}`;
  }
  return component.name;
}

function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
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

/**
 * Angular's preview path needs more than an HTML snippet — bootstrapApplication
 * mounts a standalone component, so we synthesize a tiny host. The host imports
 * every standalone class exported from the component's source file (so compound
 * parts like AccordionItem/AccordionTrigger are usable in the template) and
 * templates the component's selector with default + override props.
 *
 * Returned string is TypeScript source that the Angular preview pipeline writes
 * to disk and feeds to performCompilation alongside the package sources. The
 * bootstrap shell then imports the compiled host's class and mounts it.
 *
 * Why a synthesized host instead of an HTML snippet: Angular standalone
 * components must be declared in the host's `imports: [...]` to be usable in
 * its template. There is no Angular equivalent of the "just write the custom
 * element tag in HTML" pattern Lit uses, even though the selectors look the
 * same in markup.
 */
export function buildAngularDemo(
  component: ComponentBundle,
  overrideProps?: DemoProps,
): string {
  const props = { ...defaultPropsFromContract(component), ...(overrideProps ?? {}) };
  const componentFile = component.sources.angular?.component;
  if (!componentFile) {
    // Should not happen at runtime — DeveloperView only enables the Angular
    // tab when this file is present — but if it does we fall back to a stub
    // host so the bootstrap pipeline fails loudly with a useful message instead
    // of silently rendering nothing.
    return [
      `// Angular source unavailable for ${component.name} — preview cannot bootstrap.`,
      `import { Component } from "@angular/core";`,
      `@Component({ selector: "fsds-host", standalone: true, template: "Angular source missing for ${component.name}" })`,
      `export class HostComponent {}`,
    ].join("\n");
  }

  const exportedClasses = extractStandaloneExports(componentFile.code);
  const tag = elementTag(component, "angular");
  const child = childLabel(component);
  const attrs = renderHtmlAttrs(props);

  const node = child
    ? `<${tag}${attrs}>${escape(child)}</${tag}>`
    : `<${tag}${attrs}></${tag}>`;

  // Import path is resolved relative to wherever the synthesizer writes the
  // host file. The synthesizer is responsible for writing the host into a
  // location where `./<ComponentName>/<ComponentName>.component` resolves;
  // see runtime/angular-compiler/host.ts.
  const importPath = `./components/${component.name}/${component.name}.component.js`;

  return [
    `import { Component } from "@angular/core";`,
    `import { ${exportedClasses.join(", ")} } from "${importPath}";`,
    ``,
    `@Component({`,
    `  selector: "fsds-host",`,
    `  standalone: true,`,
    `  imports: [${exportedClasses.join(", ")}],`,
    `  template: \`${node}\`,`,
    `})`,
    `export class HostComponent {}`,
    ``,
  ].join("\n");
}

/**
 * Pull `export class FooComponent` names out of the contract-emitted source.
 * Compound contracts emit several sibling classes in the same file (e.g.
 * AccordionComponent + AccordionItemComponent + AccordionTriggerComponent…),
 * and the host needs all of them in its `imports: [...]` so the template can
 * use their selectors.
 */
function extractStandaloneExports(source: string): string[] {
  const matches = source.matchAll(/export\s+class\s+([A-Z][A-Za-z0-9_]*Component)\b/g);
  return Array.from(matches, (m) => m[1]);
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
