// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Postcard from "../Postcard.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Postcard — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("postcard");
  });

  it("merges custom class", () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("postcard");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies type=image variant class", () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: { "type": "image" } });
    expect(container.firstElementChild?.className).toContain("postcard--image");
  });

  it("applies type=video variant class", () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: { "type": "video" } });
    expect(container.firstElementChild?.className).toContain("postcard--video");
  });

  it("applies type=audio variant class", () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: { "type": "audio" } });
    expect(container.firstElementChild?.className).toContain("postcard--audio");
  });
});

describe("Postcard — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Postcard as unknown as Component<Record<string, unknown>>, { props: { "postId": "placeholder", "author": {}, "timestamp": "placeholder", "stats": {}, "aria-label": "Test Postcard", "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import PostcardContent from "../PostcardContent.svelte";
import PostcardFooter from "../PostcardFooter.svelte";
import PostcardHeader from "../PostcardHeader.svelte";

describe("Postcard — compound parts", () => {
  it("mounts PostcardContent with tag and base class", () => {
    const { container } = render(PostcardContent as Component, {
      props: { "data-testid": "postcard-postcardcontent" },
    });
    const root = container.querySelector('[data-testid="postcard-postcardcontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("postcard__content");
  });

  it("mounts PostcardFooter with tag and base class", () => {
    const { container } = render(PostcardFooter as Component, {
      props: { "data-testid": "postcard-postcardfooter" },
    });
    const root = container.querySelector('[data-testid="postcard-postcardfooter"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("footer");
    expect(root!.className.split(/\s+/)).toContain("postcard__footer");
  });

  it("mounts PostcardHeader with tag and base class", () => {
    const { container } = render(PostcardHeader as Component, {
      props: { "data-testid": "postcard-postcardheader" },
    });
    const root = container.querySelector('[data-testid="postcard-postcardheader"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("header");
    expect(root!.className.split(/\s+/)).toContain("postcard__header");
  });
});


// @custom:end
