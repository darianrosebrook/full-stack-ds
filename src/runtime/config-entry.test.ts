import { describe, it, expect, beforeEach } from "vitest";
import { buildConfigEntrySource } from "./config-entry";

const RENDERER = `
function renderComponent(props, child) {
  window.__lastRender = { props, child };
}`;

describe("buildConfigEntrySource", () => {
  it("owns the framework-neutral fsds:config message bus", () => {
    const src = buildConfigEntrySource({
      childLabel: "Button",
      defaultProps: { type: "button" },
      rendererSource: RENDERER,
    });

    expect(src).toContain('data.type !== "fsds:config"');
    expect(src).toContain("currentProps = data.props");
    expect(src).toContain('const DEFAULT_PROPS = {"type":"button"}');
    expect(src).toContain('const CHILD = "Button"');
  });

  it("applies token overrides through the same bus contract", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: {},
      rendererSource: RENDERER,
    });

    expect(src).toContain("__fsds_overrides");
    expect(src).toContain('setAttribute("data-fsds", "overrides")');
    expect(src).toContain("data.tokenCss");
  });

  it("delegates framework specifics to the renderer source", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: {},
      rendererSource: RENDERER,
    });

    expect(src).toContain(RENDERER.trim());
    // Props flow through the callback-capture wrapper before hitting the
    // framework-specific renderComponent — see the capture-surface tests
    // below for what that wrapper does when callback props are declared.
    expect(src).toContain("renderComponent(withCallbackCapture(currentProps), CHILD)");
  });

  it("posts ready after first render and forwards render errors", () => {
    const src = buildConfigEntrySource({
      childLabel: "Button",
      defaultProps: {},
      rendererSource: RENDERER,
    });

    const renderIdx = src.lastIndexOf("renderNow();");
    const readyIdx = src.indexOf('parent.postMessage({ type: "fsds:ready" }');
    expect(readyIdx).toBeGreaterThan(renderIdx);
    expect(src).toContain('type: "fsds:error"');
  });
});

/**
 * The renderer used by the capture-surface tests below records whatever
 * props it receives on window.__lastRender, so assertions can inspect
 * exactly what renderComponent(...) was called with — proving the wrapper
 * ran (and forwarded) rather than just asserting on generated source text.
 */
const RECORDING_RENDERER = `
function renderComponent(props, child) {
  window.__lastRender = { props, child };
}`;

/**
 * Runs the generated entry source in the current (jsdom) window, capturing
 * `parent.postMessage` calls since jsdom's window.parent === window in a
 * top-level document — the same-origin self-parent relationship the real
 * config-mode iframe boot script relies on for its ready/error handshake.
 *
 * The postMessage patch stays installed until `restore()` is called — tests
 * that need to invoke a captured callback (which posts a message as a *side
 * effect of that invocation*, not of running the entry source itself) must
 * do so before restoring, or the invocation's message goes to the real,
 * unpatched postMessage and is lost.
 */
function runEntrySource(src: string): { postedMessages: unknown[]; restore: () => void } {
  const postedMessages: unknown[] = [];
  const realPostMessage = window.postMessage.bind(window);
  // Intercept postMessage calls made via `parent.postMessage(...)` (parent
  // === window at top level in jsdom) so we can assert on what the capture
  // wrapper posts without depending on the async message-event round trip.
  (window as unknown as { postMessage: typeof window.postMessage }).postMessage = (
    ...args: Parameters<typeof window.postMessage>
  ) => {
    postedMessages.push(args[0]);
    return realPostMessage(...args);
  };
  // eslint-disable-next-line no-new-func -- executing the generated iframe
  // boot script is the point of this test: it proves the actual runtime
  // behavior of the string buildConfigEntrySource produces, not just its
  // shape.
  new Function(src)();
  return {
    postedMessages,
    restore: () => {
      (window as unknown as { postMessage: typeof window.postMessage }).postMessage =
        realPostMessage;
    },
  };
}

describe("buildConfigEntrySource — callback capture surface", () => {
  beforeEach(() => {
    delete (window as unknown as { __fsdsCallbackLog?: unknown }).__fsdsCallbackLog;
    delete (window as unknown as { __lastRender?: unknown }).__lastRender;
  });

  it("wraps a declared callback prop and records invocation name + payload", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: { open: true, onOpenChange: undefined },
      rendererSource: RECORDING_RENDERER,
      callbackPropNames: ["onOpenChange"],
    });
    runEntrySource(src);

    const lastRender = (window as unknown as { __lastRender: { props: Record<string, unknown> } })
      .__lastRender;
    expect(typeof lastRender.props.onOpenChange).toBe("function");

    // Invoke the wrapped callback the way a mounted component would.
    (lastRender.props.onOpenChange as (v: boolean) => void)(false);

    const log = (window as unknown as { __fsdsCallbackLog: Array<{ name: string; args: unknown[] }> })
      .__fsdsCallbackLog;
    expect(log).toHaveLength(1);
    expect(log[0].name).toBe("onOpenChange");
    expect(log[0].args).toEqual([false]);
  });

  it("posts an fsds:callback message alongside the window-scoped log entry", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: { onChange: undefined },
      rendererSource: RECORDING_RENDERER,
      callbackPropNames: ["onChange"],
    });
    const { postedMessages, restore } = runEntrySource(src);

    const lastRender = (window as unknown as { __lastRender: { props: Record<string, unknown> } })
      .__lastRender;
    (lastRender.props.onChange as (v: string) => void)("beta");
    restore();

    const callbackMessages = postedMessages.filter(
      (m): m is { type: string; name: string; args: unknown[] } =>
        typeof m === "object" && m !== null && (m as { type?: string }).type === "fsds:callback",
    );
    expect(callbackMessages).toHaveLength(1);
    expect(callbackMessages[0].name).toBe("onChange");
    expect(callbackMessages[0].args).toEqual(["beta"]);
  });

  it("forwards to the original handler so wrapping stays inert for real consumers", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: {},
      rendererSource: RECORDING_RENDERER,
      callbackPropNames: ["onOpenChange"],
    });
    // Simulate the parent posting a config payload that supplies a real
    // handler (the showcase's own onOpenChange), the way FrameworkPreview's
    // postConfig() does after mount.
    runEntrySource(src);
    let forwarded: unknown;
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "fsds:config",
          props: {
            onOpenChange: (v: boolean) => {
              forwarded = v;
            },
          },
        },
      }),
    );

    const lastRender = (window as unknown as { __lastRender: { props: Record<string, unknown> } })
      .__lastRender;
    (lastRender.props.onOpenChange as (v: boolean) => void)(true);
    expect(forwarded).toBe(true);
  });

  it("does not wrap props absent from CALLBACK_PROP_NAMES (data-driven, not hardcoded)", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: { onChange: undefined, onOpenChange: undefined },
      rendererSource: RECORDING_RENDERER,
      // Only onChange is declared — onOpenChange must pass through
      // unwrapped, proving the surface is driven by the callback-name list
      // rather than any hardcoded "on*" naming convention.
      callbackPropNames: ["onChange"],
    });
    runEntrySource(src);
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "fsds:config",
          props: { onOpenChange: () => {}, onChange: () => {} },
        },
      }),
    );

    const lastRender = (window as unknown as { __lastRender: { props: Record<string, unknown> } })
      .__lastRender;
    (lastRender.props.onOpenChange as () => void)();

    const log = (window as unknown as { __fsdsCallbackLog?: Array<{ name: string }> })
      .__fsdsCallbackLog;
    expect(log ?? []).toEqual([]);
  });

  it("stays inert when the component declares no callback props (default [])", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: { value: "x" },
      rendererSource: RECORDING_RENDERER,
      // callbackPropNames omitted entirely — the common case for a
      // component with no callback-kind contract props.
    });
    expect(src).toContain("const CALLBACK_PROP_NAMES = []");
    runEntrySource(src);
    expect(
      (window as unknown as { __fsdsCallbackLog?: unknown[] }).__fsdsCallbackLog,
    ).toEqual([]);
  });
});
