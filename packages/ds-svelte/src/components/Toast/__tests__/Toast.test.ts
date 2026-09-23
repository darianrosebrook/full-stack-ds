// @generated:start imports
import { describe, expect, it, vi, afterEach } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Toast from "../Toast.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Toast — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast");
  });

  it("merges custom class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast");
    expect(root?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("region");
  });

  it("applies variant=info variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "info" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--info");
  });

  it("applies variant=success variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "success" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--success");
  });

  it("applies variant=warning variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "warning" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--warning");
  });

  it("applies variant=error variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "error" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "politeness": "polite" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "politeness": "assertive" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--assertive");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Toast — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Toast", "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })), "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    const results = await axe(root as Element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import ToastDescription from "../ToastDescription.svelte";
import ToastItem from "../ToastItem.svelte";
import ToastTitle from "../ToastTitle.svelte";

describe("Toast — action snippet", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const undoSnippet = () =>
    createRawSnippet(() => ({
      render: () => "<button>Undo</button>",
    }));

  it("renders exactly one .toast__action containing the Undo button when an action snippet is provided", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, {
      props: { open: true, action: undoSnippet() },
    });
    const actions = document.body.querySelectorAll(".toast__action");
    expect(actions.length).toBe(1);
    const button = actions[0].querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe("Undo");
  });

  it("renders no .toast__action element when no action snippet is provided", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, {
      props: { open: true },
    });
    const action = document.body.querySelector(".toast__action");
    expect(action).toBeNull();
  });
});

describe("Toast — live-region roles", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets role=region and aria-label=Notifications on the viewport root, and aria-live=polite by default", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, {
      props: { open: true },
    });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("region");
    expect(root?.getAttribute("aria-label")).toBe("Notifications");
    expect(root?.getAttribute("aria-live")).toBe("polite");
  });

  it("sets aria-live=assertive on the viewport root when politeness=assertive", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, {
      props: { open: true, politeness: "assertive" },
    });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("aria-live")).toBe("assertive");
  });

  it("sets role=status on .toast__item and never uses role=alert anywhere in the tree", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, {
      props: { open: true },
    });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    const item = root?.querySelector(".toast__item");
    expect(item).not.toBeNull();
    expect(item?.getAttribute("role")).toBe("status");
    expect(root?.querySelectorAll('[role="alert"]').length).toBe(0);
  });
});

describe("Toast — compound parts", () => {
  it("mounts ToastDescription with tag and base class", () => {
    const { container } = render(ToastDescription as Component, {
      props: { "data-testid": "toast-toastdescription" },
    });
    const root = container.querySelector('[data-testid="toast-toastdescription"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("p");
    expect(root!.className.split(/\s+/)).toContain("toast__description");
  });

  it("mounts ToastItem with tag and base class", () => {
    const { container } = render(ToastItem as Component, {
      props: { "data-testid": "toast-toastitem" },
    });
    const root = container.querySelector('[data-testid="toast-toastitem"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("li");
    expect(root!.className.split(/\s+/)).toContain("toast__item");
  });

  it("mounts ToastTitle with tag and base class", () => {
    const { container } = render(ToastTitle as Component, {
      props: { "data-testid": "toast-toasttitle" },
    });
    const root = container.querySelector('[data-testid="toast-toasttitle"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("h3");
    expect(root!.className.split(/\s+/)).toContain("toast__title");
  });
});


// @custom:end
