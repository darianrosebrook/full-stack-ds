export function buildVueConfigRendererSource(componentName: string): string {
  const absImport = `/packages/ds-vue/src/components/${componentName}/${componentName}.vue`;

  return `import { createApp, h, reactive } from "vue";
import Component from ${JSON.stringify(absImport)};

const reactiveProps = reactive({});

function renderComponent(props, child) {
  for (const key of Object.keys(reactiveProps)) delete reactiveProps[key];
  Object.assign(reactiveProps, props || {});
  if (appMounted) return;
  appMounted = true;
  createApp({
    render() {
      return child == null
        ? h(Component, reactiveProps)
        : h(Component, reactiveProps, () => child);
    },
  }).mount("#root");
}

let appMounted = false;`;
}
