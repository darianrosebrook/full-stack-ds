import { describe, expect, it } from "vitest";
import { buildComponentIR, inferCallbackKind } from "./ir.js";
import type { ComponentContract } from "./contract.js";

describe("inferCallbackKind", () => {
  it("returns 'value' for undefined", () => {
    expect(inferCallbackKind(undefined)).toBe("value");
  });

  it("returns 'value' for value-shaped boolean handler", () => {
    expect(inferCallbackKind("(checked: boolean) => void")).toBe("value");
  });

  it("returns 'value' for value-shaped string handler", () => {
    expect(inferCallbackKind("(value: string) => void")).toBe("value");
  });

  it("returns 'event' for ChangeEvent in parameter position", () => {
    expect(
      inferCallbackKind("(event: ChangeEvent<HTMLInputElement>) => void"),
    ).toBe("event");
  });

  it("returns 'event' for plain Event parameter", () => {
    expect(inferCallbackKind("(e: Event) => void")).toBe("event");
  });

  it("returns 'event' for SyntheticEvent parameter", () => {
    expect(inferCallbackKind("(e: SyntheticEvent) => void")).toBe("event");
  });

  it("returns 'event' for KeyboardEvent parameter", () => {
    expect(
      inferCallbackKind("(e: KeyboardEvent<HTMLDivElement>) => void"),
    ).toBe("event");
  });

  it("does NOT match EventEmitter<T>", () => {
    expect(inferCallbackKind("EventEmitter<boolean>")).toBe("value");
  });

  it("does NOT match EventBus", () => {
    expect(inferCallbackKind("EventBus")).toBe("value");
  });

  it("does NOT match EventPayload in return type", () => {
    expect(inferCallbackKind("(value: boolean) => EventPayload")).toBe("value");
  });

  it("does NOT match a custom MyEvent type alias outside a function signature", () => {
    expect(inferCallbackKind("MyEvent")).toBe("value");
  });

  it("returns 'value' when no parameter is typed", () => {
    expect(inferCallbackKind("() => void")).toBe("value");
  });
});

describe("buildComponentIR — callbackKind threading", () => {
  function makeContract(handlerType: string): ComponentContract {
    return {
      name: "TestSwitch",
      anatomy: ["root"],
      props: {
        styled: {
          members: [
            { name: "checked", type: "boolean" },
            { name: "defaultChecked", type: "boolean" },
            { name: "onChange", type: handlerType },
          ],
        },
      },
      channels: {
        checked: {
          value: "checked",
          defaultValue: "defaultChecked",
          onChange: "onChange",
          valueType: "boolean",
        },
      },
      variants: {},
    };
  }

  it("infers 'value' for value-shaped handler in contract", () => {
    const ir = buildComponentIR(makeContract("(checked: boolean) => void"));
    expect(ir.behavior.normalizedChannels[0].callbackKind).toBe("value");
  });

  it("infers 'event' for event-shaped handler in contract", () => {
    const ir = buildComponentIR(
      makeContract("(event: ChangeEvent<HTMLInputElement>) => void"),
    );
    expect(ir.behavior.normalizedChannels[0].callbackKind).toBe("event");
  });

  it("does NOT infer 'event' from EventEmitter<T> handler type", () => {
    const ir = buildComponentIR(makeContract("EventEmitter<boolean>"));
    expect(ir.behavior.normalizedChannels[0].callbackKind).toBe("value");
  });
});

describe("buildComponentIR — channel without defaultValueProp", () => {
  it("normalizes channel.defaultValueProp to undefined when contract omits defaultValue", () => {
    const contract: ComponentContract = {
      name: "TestPanel",
      anatomy: ["root"],
      props: {
        styled: {
          members: [
            { name: "open", type: "boolean" },
            { name: "onOpenChange", type: "(value: boolean) => void" },
          ],
        },
      },
      channels: {
        open: {
          value: "open",
          onChange: "onOpenChange",
          valueType: "boolean",
        },
      },
      variants: {},
    };
    const ir = buildComponentIR(contract);
    expect(ir.behavior.normalizedChannels[0].defaultValueProp).toBeUndefined();
  });
});
