export function buildReactConfigRendererSource(componentName: string): string {
  const absImport = `/packages/ds-react/src/components/${componentName}/${componentName}.tsx`;

  return `import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { ${componentName} } from ${JSON.stringify(absImport)};

const container = document.getElementById("root");
const root = createRoot(container);

function renderComponent(props, child) {
  const children = child == null ? [] : [child];
  root.render(createElement(${componentName}, props, ...children));
}`;
}
