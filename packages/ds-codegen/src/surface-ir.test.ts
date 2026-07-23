import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR } from "./ir.js";
import { selectorAnchoredRootPortal } from "./semantics.js";

/**
 * Phase F-1 boundary tests. These exist to prove that the SurfaceIR builder
 * fails loud when a contract declares a `surface` block that points at parts
 * that do not exist, or at parts whose `details.role` is incompatible with
 * the surface's role expectations (anchor → "trigger"; content → one of
 * "content" | "region" | "overlay"). Without these, the F-2 Tooltip
 * migration could silently emit garbage when an author makes a part-name
 * typo or wires `content.part` at a decoration.
 */

function makeContract(overrides: Partial<ComponentContract> = {}): ComponentContract {
  return {
    name: "TestSurface",
    layer: "composer",
    ...overrides,
  } as ComponentContract;
}

describe("buildSurfaceIR — absence", () => {
  it("returns ir.surface === undefined when contract.surface is absent", () => {
    const ir = buildComponentIR(makeContract());
    expect(ir.surface).toBeUndefined();
  });

  it("returns ir.surface === undefined for a contract that has anatomy but no surface", () => {
    const ir = buildComponentIR(
      makeContract({
        anatomy: {
          parts: ["root", "trigger", "content"],
          details: {
            trigger: { role: "trigger", interactive: true },
            content: { role: "content", aria: { role: "tooltip" } },
          },
        },
      }),
    );
    expect(ir.surface).toBeUndefined();
  });
});

describe("buildSurfaceIR — anchored tooltip-like surface", () => {
  it("resolves anchor.part and content.part to PartIR references", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "TooltipLike",
        anatomy: {
          parts: ["root", "trigger", "content", "arrow"],
          details: {
            trigger: { role: "trigger", interactive: true },
            content: { role: "content", aria: { role: "tooltip" } },
            arrow: { role: "decoration" },
          },
        },
        surface: {
          kind: "tooltip",
          presence: "ephemeral",
          modality: "non-blocking",
          anchor: { part: "trigger", relation: "describedby" },
          content: { part: "content", interactive: false },
          positioning: {
            strategy: "anchored",
            placementProp: "placement",
            collision: "flip-shift",
          },
          dismissal: ["escape", "blur", "pointer-leave"],
          openTriggers: ["hover", "focus"],
        },
      }),
    );

    expect(ir.surface).toBeDefined();
    expect(ir.surface?.kind).toBe("tooltip");
    expect(ir.surface?.presence).toBe("ephemeral");
    expect(ir.surface?.modality).toBe("non-blocking");
    // anchor and content are RESOLVED PartIRs — emitters get the part
    // metadata for free without re-resolving.
    expect(ir.surface?.anchor?.part.name).toBe("trigger");
    expect(ir.surface?.anchor?.part.details?.role).toBe("trigger");
    expect(ir.surface?.anchor?.relation).toBe("describedby");
    expect(ir.surface?.content?.part.name).toBe("content");
    expect(ir.surface?.content?.interactive).toBe(false);
    expect(ir.surface?.positioning?.strategy).toBe("anchored");
    expect(ir.surface?.positioning?.placementProp).toBe("placement");
    expect(ir.surface?.positioning?.collision).toBe("flip-shift");
    expect(ir.surface?.dismissal).toEqual(["escape", "blur", "pointer-leave"]);
    expect(ir.surface?.openTriggers).toEqual(["hover", "focus"]);
    expect(ir.surface?.timing).toBeUndefined();
  });
});

describe("buildSurfaceIR — fail-loud boundary on bad part references", () => {
  it("throws when anchor.part references a part not declared in anatomy.parts", () => {
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "Broken",
          anatomy: {
            parts: ["root", "content"],
            details: {
              content: { role: "content" },
            },
          },
          surface: {
            kind: "tooltip",
            presence: "ephemeral",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "describedby" },
            content: { part: "content", interactive: false },
            openTriggers: ["hover", "focus"],
          },
        }),
      ),
    ).toThrow(/surface\.anchor\.part "trigger" is not declared/);
  });

  it("throws when content.part references a part not declared in anatomy.parts", () => {
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "Broken",
          anatomy: {
            parts: ["root", "trigger"],
            details: {
              trigger: { role: "trigger", interactive: true },
            },
          },
          surface: {
            kind: "tooltip",
            presence: "ephemeral",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "describedby" },
            content: { part: "content", interactive: false },
            openTriggers: ["hover", "focus"],
          },
        }),
      ),
    ).toThrow(/surface\.content\.part "content" is not declared/);
  });

  it("throws when anchor.part references a part whose details.role !== 'trigger'", () => {
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "Broken",
          anatomy: {
            parts: ["root", "trigger", "content"],
            details: {
              // anatomically present but wrong role
              trigger: { role: "decoration" },
              content: { role: "content" },
            },
          },
          surface: {
            kind: "tooltip",
            presence: "ephemeral",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "describedby" },
            content: { part: "content", interactive: false },
            openTriggers: ["hover", "focus"],
          },
        }),
      ),
    ).toThrow(/anchor\.part "trigger" must have details\.role === "trigger"/);
  });

  it("throws when content.part references a part whose details.role is not content|region|overlay", () => {
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "Broken",
          anatomy: {
            parts: ["root", "trigger", "decoration"],
            details: {
              trigger: { role: "trigger", interactive: true },
              decoration: { role: "decoration" },
            },
          },
          surface: {
            kind: "tooltip",
            presence: "ephemeral",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "describedby" },
            content: { part: "decoration", interactive: false },
            openTriggers: ["hover", "focus"],
          },
        }),
      ),
    ).toThrow(/content\.part "decoration" must have details\.role of "content", "region", or "overlay"/);
  });

  it("throws when anchor.part references a part with no details block at all", () => {
    // Catches the case where author declared the part name but forgot to
    // mark its role.
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "Broken",
          anatomy: {
            parts: ["root", "trigger", "content"],
            details: {
              // trigger has no details entry; details.role is undefined
              content: { role: "content" },
            },
          },
          surface: {
            kind: "tooltip",
            presence: "ephemeral",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "describedby" },
            content: { part: "content", interactive: false },
            openTriggers: ["hover", "focus"],
          },
        }),
      ),
    ).toThrow(/anchor\.part "trigger" must have details\.role === "trigger" \(got undefined\)/);
  });
});

describe("buildSurfaceIR — openTriggers validation", () => {
  it("requires openTriggers when surface.kind === 'tooltip'", () => {
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "BrokenTooltip",
          anatomy: {
            parts: ["root", "trigger", "content"],
            details: {
              trigger: { role: "trigger", interactive: true },
              content: { role: "content", aria: { role: "tooltip" } },
            },
          },
          surface: {
            kind: "tooltip",
            presence: "ephemeral",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "describedby" },
            content: { part: "content", interactive: false },
            // omitted openTriggers
          },
        }),
      ),
    ).toThrow(/surface\.openTriggers must declare at least one of "hover" \| "focus" \| "click"/);
  });

  it("requires openTriggers when positioning.strategy === 'anchored' (any kind)", () => {
    expect(() =>
      buildComponentIR(
        makeContract({
          name: "BrokenAnchored",
          anatomy: {
            parts: ["root", "trigger", "content"],
            details: {
              trigger: { role: "trigger", interactive: true },
              content: { role: "content" },
            },
          },
          surface: {
            kind: "popover",
            presence: "persistent",
            modality: "non-blocking",
            anchor: { part: "trigger", relation: "controls-expanded" },
            content: { part: "content", interactive: true },
            positioning: { strategy: "anchored" },
            // omitted openTriggers
          },
        }),
      ),
    ).toThrow(/surface\.openTriggers must declare at least one of/);
  });

  it("does NOT require openTriggers when surface is non-anchored (e.g. toast, centered dialog)", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "ToastOk",
        anatomy: {
          parts: ["root", "content"],
          details: {
            content: { role: "content" },
          },
        },
        surface: {
          kind: "toast",
          presence: "ephemeral",
          modality: "non-blocking",
          content: { part: "content", interactive: false },
          positioning: { strategy: "viewport-edge" },
          dismissal: ["timeout", "close-button"],
        },
      }),
    );
    expect(ir.surface?.openTriggers).toEqual([]);
  });

  it("copies openTriggers through verbatim and preserves order", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "PopoverLike",
        anatomy: {
          parts: ["root", "trigger", "content"],
          details: {
            trigger: { role: "trigger", interactive: true },
            content: { role: "content" },
          },
        },
        surface: {
          kind: "popover",
          presence: "persistent",
          modality: "non-blocking",
          anchor: { part: "trigger", relation: "controls-expanded" },
          content: { part: "content", interactive: true },
          positioning: { strategy: "anchored" },
          openTriggers: ["click"],
        },
      }),
    );
    expect(ir.surface?.openTriggers).toEqual(["click"]);
  });
});

describe("buildSurfaceIR — unanchored dialog-like surface", () => {
  it("resolves content only (no anchor) when surface declares no anchor", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "DialogLike",
        anatomy: {
          parts: ["root", "content"],
          details: {
            content: { role: "content", aria: { role: "dialog" } },
          },
        },
        surface: {
          kind: "dialog",
          presence: "persistent",
          modality: "blocking",
          content: { part: "content", interactive: true },
          positioning: { strategy: "centered" },
          dismissal: ["escape", "close-button", "outside-click"],
        },
      }),
    );

    expect(ir.surface).toBeDefined();
    expect(ir.surface?.kind).toBe("dialog");
    expect(ir.surface?.modality).toBe("blocking");
    expect(ir.surface?.anchor).toBeUndefined();
    expect(ir.surface?.content?.part.name).toBe("content");
    expect(ir.surface?.content?.interactive).toBe(true);
    expect(ir.surface?.positioning?.strategy).toBe("centered");
    expect(ir.surface?.positioning?.placementProp).toBeUndefined();
    expect(ir.surface?.positioning?.collision).toBeUndefined();
    expect(ir.surface?.dismissal).toEqual([
      "escape",
      "close-button",
      "outside-click",
    ]);
  });

  it("accepts content.part whose role is 'region' (e.g. coachmark)", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "CoachmarkLike",
        anatomy: {
          parts: ["root", "trigger", "content"],
          details: {
            trigger: { role: "trigger", interactive: true },
            content: { role: "region" },
          },
        },
        surface: {
          kind: "coachmark",
          presence: "persistent",
          modality: "blocking",
          anchor: { part: "trigger", relation: "describedby" },
          content: { part: "content", interactive: true },
        },
      }),
    );
    expect(ir.surface?.content?.part.details?.role).toBe("region");
  });

  it("accepts content.part whose role is 'overlay'", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "OverlayLike",
        anatomy: {
          parts: ["root", "content"],
          details: {
            content: { role: "overlay" },
          },
        },
        surface: {
          kind: "dialog",
          presence: "persistent",
          modality: "blocking",
          content: { part: "content", interactive: true },
          positioning: { strategy: "centered" },
        },
      }),
    );
    expect(ir.surface?.content?.part.details?.role).toBe("overlay");
  });
});

describe("buildSurfaceIR — timing prop names copy through", () => {
  it("copies timing prop names verbatim without resolving values", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "TooltipWithTiming",
        anatomy: {
          parts: ["root", "trigger", "content"],
          details: {
            trigger: { role: "trigger", interactive: true },
            content: { role: "content", aria: { role: "tooltip" } },
          },
        },
        surface: {
          kind: "tooltip",
          presence: "ephemeral",
          modality: "non-blocking",
          anchor: { part: "trigger", relation: "describedby" },
          content: { part: "content", interactive: false },
          positioning: { strategy: "anchored", collision: "flip-shift" },
          dismissal: ["escape", "blur", "pointer-leave"],
          openTriggers: ["hover", "focus"],
          timing: {
            openDelayProp: "openDelay",
            closeDelayProp: "closeDelay",
          },
        },
      }),
    );

    expect(ir.surface?.timing).toEqual({
      openDelayProp: "openDelay",
      closeDelayProp: "closeDelay",
      autoDismissProp: undefined,
    });
  });

  it("copies autoDismissProp for toast-like surfaces", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "ToastLike",
        anatomy: {
          parts: ["root", "content"],
          details: {
            content: { role: "content" },
          },
        },
        surface: {
          kind: "toast",
          presence: "ephemeral",
          modality: "non-blocking",
          content: { part: "content", interactive: false },
          positioning: { strategy: "viewport-edge" },
          dismissal: ["timeout", "close-button"],
          timing: { autoDismissProp: "duration" },
        },
      }),
    );

    expect(ir.surface?.timing?.autoDismissProp).toBe("duration");
    expect(ir.surface?.timing?.openDelayProp).toBeUndefined();
  });
});

describe("buildSurfaceIR — defaults", () => {
  it("defaults surface.dismissal to [] when omitted from the contract", () => {
    const ir = buildComponentIR(
      makeContract({
        name: "DialogNoDismissal",
        anatomy: {
          parts: ["root", "content"],
          details: {
            content: { role: "content" },
          },
        },
        surface: {
          kind: "dialog",
          presence: "persistent",
          modality: "non-blocking",
          content: { part: "content", interactive: true },
          positioning: { strategy: "centered" },
        },
      }),
    );
    expect(ir.surface?.dismissal).toEqual([]);
  });
});

describe("buildSurfaceIR — selector-sourced anchor (coachmark tour)", () => {
  function makeTourContract(
    surfaceAnchor: unknown = {
      selector: { prop: "steps", path: "anchor", indexChannel: "step" },
    },
    extra: Partial<ComponentContract> = {},
  ): ComponentContract {
    return makeContract({
      name: "TourLike",
      props: {
        styled: {
          members: [
            { name: "steps", type: "TourStepSpec[]" },
            { name: "placement", type: "string" },
          ],
        },
      },
      channels: {
        step: {
          value: "index",
          defaultValue: "defaultIndex",
          onChange: "onStepChange",
          valueType: "number",
        },
      },
      anatomy: {
        parts: ["root", "content"],
        details: { content: { role: "content" } },
      },
      surface: {
        kind: "coachmark",
        presence: "persistent",
        modality: "non-blocking",
        anchor: surfaceAnchor,
        positioning: {
          strategy: "anchored",
          placementProp: "placement",
          collision: "flip-shift",
        },
      },
      ...extra,
    } as Partial<ComponentContract>);
  }

  it("builds selectorAnchor facts and leaves the part-anchor undefined", () => {
    const ir = buildComponentIR(makeTourContract());
    expect(ir.surface?.selectorAnchor).toEqual({
      prop: "steps",
      path: "anchor",
      indexChannel: "step",
    });
    expect(ir.surface?.anchor).toBeUndefined();
  });

  it("does NOT require openTriggers for a selector-anchored anchored strategy (tours open programmatically)", () => {
    // The part-anchored equivalent throws (pinned above); the selector
    // form must not, because there is no in-tree trigger to listen on.
    const ir = buildComponentIR(makeTourContract());
    expect(ir.surface?.openTriggers).toEqual([]);
  });

  it("throws when selector.prop is not a declared prop", () => {
    expect(() =>
      buildComponentIR(
        makeTourContract({
          selector: { prop: "missing", path: "anchor", indexChannel: "step" },
        }),
      ),
    ).toThrow(/surface\.anchor\.selector\.prop "missing" is not a declared prop/);
  });

  it("throws when selector.prop is not array-typed", () => {
    expect(() =>
      buildComponentIR(
        makeTourContract({
          selector: { prop: "placement", path: "anchor", indexChannel: "step" },
        }),
      ),
    ).toThrow(/must be array-typed \(got "string"\)/);
  });

  it("throws when selector.indexChannel is not a declared channel", () => {
    expect(() =>
      buildComponentIR(
        makeTourContract({
          selector: { prop: "steps", path: "anchor", indexChannel: "page" },
        }),
      ),
    ).toThrow(/surface\.anchor\.selector\.indexChannel "page" is not a declared channel/);
  });

  it("throws when selector.path is empty", () => {
    expect(() =>
      buildComponentIR(
        makeTourContract({
          selector: { prop: "steps", path: "", indexChannel: "step" },
        }),
      ),
    ).toThrow(/surface\.anchor\.selector\.path must be a non-empty member name/);
  });
});

describe("selectorAnchoredRootPortal — semantics predicate", () => {
  it("returns the selector facts only when portal.enabled AND strategy anchored AND a selector anchor exists", () => {
    const facts = { prop: "steps", path: "anchor", indexChannel: "step" };
    const base = {
      behavior: { portal: { enabled: true } },
      surface: {
        positioning: { strategy: "anchored" as const },
        selectorAnchor: facts,
      },
    };
    expect(selectorAnchoredRootPortal(base)).toEqual(facts);
    expect(
      selectorAnchoredRootPortal({
        ...base,
        behavior: { portal: { enabled: false } },
      }),
    ).toBeNull();
    expect(
      selectorAnchoredRootPortal({
        ...base,
        surface: { ...base.surface, positioning: { strategy: "centered" } },
      }),
    ).toBeNull();
    expect(
      selectorAnchoredRootPortal({
        ...base,
        surface: { ...base.surface, selectorAnchor: undefined },
      }),
    ).toBeNull();
  });
});
