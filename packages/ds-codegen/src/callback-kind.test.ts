import { describe, expect, it } from "vitest";
import { buildComponentIR, resolveCallbackKind } from "./ir.js";
import type { ComponentContract, ContractChannel } from "./contract.js";

// resolveCallbackKind is the IR's framework-neutral classifier for
// channel change-handler shape. The boundary it enforces: the contract
// declares the shape via `callbackKind`; the IR does NOT inspect the
// handler's TypeScript type for React/DOM event identifiers. This test
// covers both a React-shaped callback (handler param typed as a React
// event) and a non-React-shaped callback (handler param typed as a
// platform-neutral value), proving the IR no longer routes through
// React-framed inference.

describe("resolveCallbackKind", () => {
  it("defaults to 'value' when callbackKind is omitted", () => {
    expect(resolveCallbackKind({})).toBe("value");
  });

  it("returns the contract-declared 'value' classification", () => {
    expect(resolveCallbackKind({ callbackKind: "value" })).toBe("value");
  });

  it("returns the contract-declared 'event' classification", () => {
    expect(resolveCallbackKind({ callbackKind: "event" })).toBe("event");
  });

  it("ignores the handler's TypeScript type — classification is contract-only", () => {
    // A channel handler typed against a React event but no explicit
    // callbackKind still classifies as "value" — the IR refuses to
    // infer from React-shaped type names.
    expect(resolveCallbackKind({} as ContractChannel)).toBe("value");
  });
});

describe("channel IR callback kind — end-to-end", () => {
  function makeContract(channel: Partial<ContractChannel>): ComponentContract {
    return {
      name: "Probe",
      layer: "primitive",
      props: {
        styled: {
          members: [
            { name: "value", type: "string" },
            // Handler typed with a React event payload — historically
            // would have been "event" via inference. Now stays "value"
            // unless the contract declares otherwise.
            {
              name: "onChange",
              type: "(e: ChangeEvent<HTMLInputElement>) => void",
            },
          ],
        },
      },
      channels: {
          input: {
            value: "value",
            onChange: "onChange",
            ...channel,
          } as ContractChannel,
        },
    } as ComponentContract;
  }

  it("non-React-shaped callback (value-shaped handler, no declaration) is 'value'", () => {
    const contract: ComponentContract = {
      name: "Probe",
      layer: "primitive",
      props: {
        styled: {
          members: [
            { name: "checked", type: "boolean" },
            { name: "onChange", type: "(checked: boolean) => void" },
          ],
        },
      },
      channels: {
        checked: { value: "checked", onChange: "onChange" },
      },
    } as ComponentContract;
    const ir = buildComponentIR(contract);
    const channel = ir.behavior.normalizedChannels[0];
    expect(channel.callbackKind).toBe("value");
  });

  it("React-shaped callback (ChangeEvent handler, no declaration) is still 'value' — no inference leak", () => {
    const ir = buildComponentIR(makeContract({}));
    const channel = ir.behavior.normalizedChannels[0];
    expect(channel.callbackKind).toBe("value");
  });

  it("React-shaped callback with explicit callbackKind='event' is 'event'", () => {
    const ir = buildComponentIR(makeContract({ callbackKind: "event" }));
    const channel = ir.behavior.normalizedChannels[0];
    expect(channel.callbackKind).toBe("event");
  });
});
