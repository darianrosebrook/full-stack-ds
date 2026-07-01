export function buildLitConfigRendererSource(
  componentName: string,
  tag: string,
): string {
  const absImport = `/packages/ds-lit/src/components/${componentName}/${componentName}.ts`;

  return `import ${JSON.stringify(absImport)};

const target = document.getElementById("root");
if (!target) throw new Error("fsds-lit-preview: #root missing from shell");
const element = document.createElement(${JSON.stringify(tag)});
target.replaceChildren(element);
let appliedKeys = [];

function renderComponent(props, child) {
  if (child != null) element.textContent = child;
  for (const key of appliedKeys) {
    if (!(key in props)) element[key] = undefined;
  }
  appliedKeys = Object.keys(props);
  for (const [key, value] of Object.entries(props)) {
    element[key] = value;
  }
}`;
}
