// FIGMA-PLUGIN-UI-PORT-01
//
// Dev Mode codegen: renders code previews for a materialized descriptor +
// variant-row selection. This module does not read Figma document state; it
// is a pure function of (descriptor, target, variantValues) so it is testable
// without a Figma global. `plugin.ts`'s `figma.codegen.on("generate")`
// handler resolves the descriptor + variant values from plugin data and
// calls into `generateCodePreviewsForDescriptor` below.

import type { FigmaComponentDescriptor, FigmaCssBlock } from "./ui-model.js";

export type { FigmaCssBlock };

export type CodegenTarget =
  | "react"
  | "svelte"
  | "vue"
  | "angular"
  | "lit"
  | "react-native"
  | "swiftui"
  | "compose";

export const CODEGEN_TARGETS: readonly CodegenTarget[] = [
  "react",
  "svelte",
  "vue",
  "angular",
  "lit",
  "react-native",
  "swiftui",
  "compose",
];

export function isCodegenTarget(value: string): value is CodegenTarget {
  return (CODEGEN_TARGETS as readonly string[]).includes(value);
}

export function getDefaultVariantValues(
  descriptor: FigmaComponentDescriptor,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [axis, variants] of Object.entries(descriptor.variants)) {
    if (variants[0]) values[axis] = variants[0];
  }
  return values;
}

export function generateCodePreviewsForDescriptor(
  descriptor: FigmaComponentDescriptor,
  options: {
    target?: CodegenTarget;
    variantValues?: Record<string, string>;
  } = {},
): FigmaCodegenResult[] {
  const target = options.target ?? "react";
  const variantValues = options.variantValues ?? getDefaultVariantValues(descriptor);
  return [generateTargetCodePreview(descriptor, target, variantValues)];
}

function generateTargetCodePreview(
  descriptor: FigmaComponentDescriptor,
  target: CodegenTarget,
  variantValues: Record<string, string>,
): FigmaCodegenResult {
  switch (target) {
    case "react":
      return {
        title: "React",
        language: "TYPESCRIPT",
        code: [
          `import { ${descriptor.component.name} } from "@full-stack-ds/react";`,
          "",
          renderJsxComponent(descriptor.component.name, variantValues),
        ].join("\n"),
      };
    case "svelte":
      return {
        title: "Svelte",
        language: "TYPESCRIPT",
        code: [
          `<script lang="ts">`,
          `  import { ${descriptor.component.name} } from "@full-stack-ds/svelte";`,
          `</script>`,
          "",
          renderJsxComponent(descriptor.component.name, variantValues),
        ].join("\n"),
      };
    case "vue":
      return {
        title: "Vue",
        language: "HTML",
        code: [
          `<script setup lang="ts">`,
          `import { ${descriptor.component.name} } from "@full-stack-ds/vue";`,
          `</script>`,
          "",
          `<template>`,
          `  ${renderJsxComponent(descriptor.component.name, variantValues)}`,
          `</template>`,
        ].join("\n"),
      };
    case "angular":
      return {
        title: "Angular",
        language: "HTML",
        code: renderHtmlElement(
          `fsds-${kebabCase(descriptor.component.name)}`,
          descriptor.component.name,
          variantValues,
        ),
      };
    case "lit":
      return {
        title: "Lit",
        language: "TYPESCRIPT",
        code: [
          `import { html } from "lit";`,
          `import "@full-stack-ds/lit";`,
          "",
          "const template = html`",
          indent(
            renderHtmlElement(
              `fsds-${kebabCase(descriptor.component.name)}`,
              descriptor.component.name,
              variantValues,
            ),
            "  ",
          ),
          "`;",
        ].join("\n"),
      };
    case "react-native":
      return {
        title: "React Native",
        language: "TYPESCRIPT",
        code: [
          `// React Native target: add the mobile package import once it exists.`,
          renderJsxComponent(descriptor.component.name, variantValues),
        ].join("\n"),
      };
    case "swiftui":
      return {
        title: "SwiftUI",
        language: "SWIFT",
        code: renderSwiftUiComponent(descriptor.component.name, variantValues),
      };
    case "compose":
      return {
        title: "Android Compose",
        language: "KOTLIN",
        code: renderComposeComponent(descriptor.component.name, variantValues),
      };
  }
}

function renderJsxComponent(
  componentName: string,
  props: Record<string, string>,
): string {
  const propText = renderJsxProps(props);
  return `<${componentName}${propText}>${componentName}</${componentName}>`;
}

function renderJsxProps(props: Record<string, string>): string {
  const entries = Object.entries(props);
  if (entries.length === 0) return "";
  return ` ${entries.map(([key, value]) => `${key}="${escapeAttribute(value)}"`).join(" ")}`;
}

function renderHtmlElement(
  tagName: string,
  content: string,
  attrs: Record<string, string>,
): string {
  const attrText = renderHtmlAttrs(attrs);
  return `<${tagName}${attrText}>${content}</${tagName}>`;
}

function renderHtmlAttrs(attrs: Record<string, string>): string {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return "";
  return ` ${entries.map(([key, value]) => `${kebabCase(key)}="${escapeAttribute(value)}"`).join(" ")}`;
}

function renderSwiftUiComponent(
  componentName: string,
  props: Record<string, string>,
): string {
  const args = Object.entries(props).map(
    ([key, value]) => `${key}: .${swiftEnumCase(value)}`,
  );
  return `${componentName}(${[`"${componentName}"`, ...args].join(", ")})`;
}

function renderComposeComponent(
  componentName: string,
  props: Record<string, string>,
): string {
  const args = Object.entries(props).map(
    ([key, value]) => `${key} = ${componentName}${pascalCase(key)}.${pascalCase(value)}`,
  );
  return `${componentName}(${[`text = "${componentName}"`, ...args].join(", ")})`;
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function kebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function pascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function swiftEnumCase(value: string): string {
  const normalized = pascalCase(value);
  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function indent(value: string, prefix: string): string {
  return value.split("\n").map((line) => `${prefix}${line}`).join("\n");
}
