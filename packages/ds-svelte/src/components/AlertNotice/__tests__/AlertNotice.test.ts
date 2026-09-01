// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import AlertNotice from "../AlertNotice.svelte";
// @generated:end

// @generated:start tests
describe("AlertNotice — unit", () => {
  it("renders with default props", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("alert-notice");
  });

  it("merges custom class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("alert-notice");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("alert");
  });

  it("applies status=info variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "info" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--info");
  });

  it("applies status=success variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "success" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--success");
  });

  it("applies status=warning variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "warning" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--warning");
  });

  it("applies status=error variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "error" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--error");
  });

  it("applies level=page variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "level": "page" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--page");
  });

  it("applies level=section variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "level": "section" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--section");
  });

  it("applies level=inline variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "level": "inline" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--inline");
  });
});

describe("AlertNotice — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test AlertNotice" } });
    const results = await axe(container);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "list",
      "region",
      "role-img-alt",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import AlertNoticeBody from "../AlertNoticeBody.svelte";
import AlertNoticeTitle from "../AlertNoticeTitle.svelte";

describe("AlertNotice — compound parts", () => {
  it("mounts AlertNoticeBody with tag and base class", () => {
    const { container } = render(AlertNoticeBody as Component, {
      props: { "data-testid": "alertnotice-alertnoticebody" },
    });
    const root = container.querySelector('[data-testid="alertnotice-alertnoticebody"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("alert-notice__body");
  });

  it("mounts AlertNoticeTitle with tag and base class", () => {
    const { container } = render(AlertNoticeTitle as Component, {
      props: { "data-testid": "alertnotice-alertnoticetitle" },
    });
    const root = container.querySelector('[data-testid="alertnotice-alertnoticetitle"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("h3");
    expect(root!.className.split(/\s+/)).toContain("alert-notice__title");
  });
});


// @custom:end
