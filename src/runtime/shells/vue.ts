import { rewriteVueSource } from "../rewriteImports";
import { jsLiteral } from "./encode";

interface VueShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

const VUE_ESM = "https://esm.sh/vue@3.5?dev";
const VUE_COMPILER_ESM = "https://esm.sh/@vue/compiler-sfc@3.5/dist/compiler-sfc.esm-browser.js";

/**
 * Vue 3 SFC compiled in-iframe via @vue/compiler-sfc's browser ESM build.
 * Strategy:
 *   1. Parse the .vue SFC with compiler-sfc.
 *   2. Compile <script setup> with compileScript, then compile <template>.
 *   3. Glue compiled output into a JS module and import it as a blob URL.
 *
 * compiler-sfc's browser build expects ESM, so this all lives in a
 * `<script type="module">`.
 */
export function buildVueShell({
  componentName,
  componentSource,
  css,
  demo,
}: VueShellInput): string {
  const rewritten = rewriteVueSource(componentSource);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
  #root { display: contents; }
  #__fsds_err { position: fixed; inset: 12px; padding: 12px; background: #fee; color: #900; font-family: ui-monospace, monospace; font-size: 12px; border: 1px solid #fbb; border-radius: 6px; white-space: pre-wrap; overflow: auto; display: none; }
</style>
${css ? `<style data-fsds="component-css">${css.replace(/<\/style>/g, "<\\/style>")}</style>` : ""}
<script type="importmap">
{
  "imports": {
    "vue": "${VUE_ESM}"
  }
}
</script>
<script src="https://unpkg.com/@babel/standalone@7.27.0/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<div id="__fsds_err"></div>
<script type="module">
const errEl = document.getElementById("__fsds_err");
function showError(msg) {
  errEl.textContent = String(msg);
  errEl.style.display = "block";
  try { parent.postMessage({ type: "fsds:error", message: String(msg) }, "*"); } catch (e) {}
}
window.addEventListener("error", (e) => showError(e.error?.stack || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason?.stack || e.reason));

async function waitForBabel(timeoutMs = 10000) {
  const start = Date.now();
  while (!window.Babel) {
    if (Date.now() - start > timeoutMs) throw new Error("Babel standalone never loaded");
    await new Promise((r) => setTimeout(r, 50));
  }
}

try {
  const sfcSource = ${jsLiteral(rewritten)};
  const demoSource = ${jsLiteral(demo)};

  const { parse, compileScript } = await import("${VUE_COMPILER_ESM}");
  await waitForBabel();

  function compileSfc(code, filename, id) {
    const { descriptor, errors } = parse(code, { filename });
    if (errors.length) throw new Error("SFC parse: " + errors.map(e => e.message).join("; "));
    // inlineTemplate: true bakes the template render fn directly into the
    // script's default export, so we don't have to glue script + template
    // outputs together (which is brittle: different Vue versions emit
    // different export shapes).
    const scriptCompiled = compileScript(descriptor, {
      id,
      inlineTemplate: true,
      babelParserPlugins: ["typescript"],
      templateOptions: {
        compilerOptions: { expressionPlugins: ["typescript"] },
      },
    });
    // compileScript preserves TypeScript syntax in the output; strip it with
    // Babel so the resulting blob is valid JS the browser can execute.
    const stripped = window.Babel.transform(scriptCompiled.content, {
      filename,
      presets: [["typescript", { allExtensions: true, onlyRemoveTypeImports: false }]],
    });
    return stripped.code;
  }

  const compName = ${JSON.stringify(componentName)};
  const compiled = compileSfc(sfcSource, compName + ".vue", "fsds-comp");
  const compiledDemo = compileSfc(demoSource, "Demo.vue", "fsds-demo");
  const compBlob = URL.createObjectURL(new Blob([compiled], { type: "text/javascript" }));
  // Rewrite the demo's import of the component to point at the blob URL.
  const demoFinal = compiledDemo.replace(
    new RegExp("from\\\\s+[\\"']\\\\./" + compName + "\\\\.vue[\\"']", "g"),
    "from " + JSON.stringify(compBlob)
  );
  const demoBlob = URL.createObjectURL(new Blob([demoFinal], { type: "text/javascript" }));
  const [{ createApp }, demoMod] = await Promise.all([
    import("vue"),
    import(demoBlob),
  ]);
  createApp(demoMod.default).mount("#root");
  parent.postMessage({ type: "fsds:ready" }, "*");
} catch (e) {
  showError(e.stack || e.message);
}
</script>
</body>
</html>`;
}
