function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSvelteConfigRendererSource(
  componentName: string,
  childLabel: string | null,
): string {
  const absImport = `/packages/ds-svelte/src/components/${componentName}/${componentName}.svelte`;
  const childHtml = childLabel ? `<span>${escapeHtml(childLabel)}</span>` : null;
  const childHtmlExpr = childHtml == null ? "null" : JSON.stringify(childHtml);

  return `import Component from ${JSON.stringify(absImport)};
import { mount, unmount, createRawSnippet } from "svelte";

const target = document.getElementById("root");
if (!target) throw new Error("fsds-svelte-preview: #root missing from shell");
const CHILD_HTML = ${childHtmlExpr};
let mounted = null;

function propsForRender(props) {
  if (CHILD_HTML == null) return props;
  return {
    ...props,
    children: createRawSnippet(() => ({ render: () => CHILD_HTML })),
  };
}

function renderComponent(props) {
  if (mounted) {
    unmount(mounted);
    target.replaceChildren();
  }
  mounted = mount(Component, { target, props: propsForRender(props) });
}`;
}
